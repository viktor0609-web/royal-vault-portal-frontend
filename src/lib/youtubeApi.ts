// YouTube Data API v3 Integration
// This file contains the actual YouTube API integration

import { validateEnvironment } from './envValidation';

// Type declarations for Google API
declare global {
    interface Window {
        gapi: any;
        google: any;
    }
}

interface YouTubeVideoMetadata {
    title: string;
    description: string;
    tags: string[];
    privacy: 'public' | 'unlisted' | 'private';
}

interface YouTubeUploadResponse {
    videoId: string;
    videoUrl: string;
    title: string;
    description: string;
    thumbnailUrl: string;
}

interface UploadProgress {
    percentage: number;
    status: 'uploading' | 'processing' | 'complete';
    message?: string;
}

class YouTubeAPI {
    private apiKey: string;
    private clientId: string;
    private clientSecret: string;
    private accessToken: string | null = null;
    private isInitialized: boolean = false;

    constructor() {
        // These would come from environment variables
        this.apiKey = import.meta.env.VITE_YOUTUBE_API_KEY || '';
        this.clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '';
        this.clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '';
    }

    // Initialize YouTube API and handle authentication
    async initialize(): Promise<boolean> {
        try {
            // Validate environment variables first
            const validation = validateEnvironment();
            if (!validation.isValid) {
                console.error('Environment validation failed:', validation.errors);
                console.error('Please check your .env file and ensure all YouTube API credentials are properly configured.');
                return false;
            }

            console.log('✅ Environment validation passed');

            // Load Google Identity Services
            await this.loadGoogleIdentityServices();
            console.log('✅ Google Identity Services loaded');

            // Initialize Google API client
            await this.initializeGapiClient();
            console.log('✅ Google API client initialized');

            // Load stored token if available
            this.loadStoredToken();

            this.isInitialized = true;
            console.log('✅ YouTube API initialization complete');
            return true;
        } catch (error) {
            console.error('Failed to initialize YouTube API:', error);
            return false;
        }
    }

    // Load stored token from localStorage
    private loadStoredToken(): void {
        const storedToken = localStorage.getItem('youtube_access_token');
        const tokenExpiry = localStorage.getItem('youtube_token_expiry');

        if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            this.accessToken = storedToken;
            console.log('✅ Loaded valid stored YouTube token');
        } else if (storedToken) {
            // Token is expired, clear it
            localStorage.removeItem('youtube_access_token');
            localStorage.removeItem('youtube_token_expiry');
            console.log('⚠️ Stored YouTube token expired, cleared');
        }
    }

    // Load Google Identity Services
    private loadGoogleIdentityServices(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('🔄 Loading Google Identity Services...');

            if (window.google) {
                console.log('✅ Google Identity Services already loaded');
                resolve();
                return;
            }

            // Check if script is already being loaded
            const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (existingScript) {
                console.log('⏳ Google Identity Services script already exists, waiting for load...');
                existingScript.addEventListener('load', () => {
                    console.log('✅ Google Identity Services loaded from existing script');
                    resolve();
                });
                existingScript.addEventListener('error', () => {
                    console.error('❌ Failed to load Google Identity Services from existing script');
                    reject(new Error('Failed to load Google Identity Services'));
                });
                return;
            }

            console.log('📥 Creating new Google Identity Services script...');
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.onload = () => {
                console.log('✅ Google Identity Services script loaded successfully');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Failed to load Google Identity Services script');
                reject(new Error('Failed to load Google Identity Services'));
            };
            document.head.appendChild(script);
        });
    }

    // Initialize GAPI client
    private async initializeGapiClient(): Promise<void> {
        return new Promise((resolve, reject) => {
            console.log('🔄 Initializing GAPI client...');

            if (window.gapi) {
                console.log('✅ GAPI already available, initializing client...');
                window.gapi.load('client', async () => {
                    try {
                        console.log('🔄 GAPI client loading, initializing with API key...');
                        await window.gapi.client.init({
                            apiKey: this.apiKey,
                            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
                        });
                        console.log('✅ GAPI client initialized successfully');
                        resolve();
                    } catch (error) {
                        console.error('❌ GAPI client initialization failed:', error);
                        reject(error);
                    }
                });
            } else {
                console.log('📥 GAPI not available, loading script...');
                // Load GAPI if not already loaded
                const script = document.createElement('script');
                script.src = 'https://apis.google.com/js/api.js';
                script.onload = () => {
                    console.log('✅ GAPI script loaded, initializing client...');
                    window.gapi.load('client', async () => {
                        try {
                            console.log('🔄 GAPI client loading, initializing with API key...');
                            await window.gapi.client.init({
                                apiKey: this.apiKey,
                                discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest']
                            });
                            console.log('✅ GAPI client initialized successfully');
                            resolve();
                        } catch (error) {
                            console.error('❌ GAPI client initialization failed:', error);
                            reject(error);
                        }
                    });
                };
                script.onerror = () => {
                    console.error('❌ Failed to load GAPI script');
                    reject(new Error('Failed to load GAPI'));
                };
                document.head.appendChild(script);
            }
        });
    }

    // Authenticate user with Google Identity Services using redirect flow
    async authenticate(): Promise<boolean> {
        try {
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    return false;
                }
            }

            // Check if we have a stored token
            const storedToken = localStorage.getItem('youtube_access_token');
            const tokenExpiry = localStorage.getItem('youtube_token_expiry');

            if (storedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
                this.accessToken = storedToken;
                return true;
            }

            // Use redirect flow instead of popup to avoid COOP issues
            console.log('Starting YouTube authentication with redirect flow...');
            return this.authenticateWithRedirect();
        } catch (error) {
            console.error('YouTube authentication failed:', error);
            return false;
        }
    }

    // Redirect-based authentication flow
    private authenticateWithRedirect(): boolean {
        const redirectUri = window.location.origin + '/auth/youtube/callback';
        const scope = 'https://www.googleapis.com/auth/youtube.upload';
        const state = Math.random().toString(36).substring(2, 15);

        // Debug: Log the redirect URI being used
        console.log('🔧 OAuth Debug Info:');
        console.log('Current origin:', window.location.origin);
        console.log('Redirect URI:', redirectUri);
        console.log('Client ID:', this.clientId);
        console.log('Make sure this redirect URI is added to Google Cloud Console');
        console.log('Required redirect URIs in Google Cloud Console:');
        console.log('  - http://localhost:5173/auth/youtube/callback');
        console.log('  - https://localhost:5173/auth/youtube/callback');
        console.log('  - Your production domain/auth/youtube/callback');

        // Validate client ID format
        if (!this.clientId || !this.clientId.includes('.apps.googleusercontent.com')) {
            console.error('❌ Invalid Client ID format. Expected format: xxxxxx.apps.googleusercontent.com');
            alert('YouTube API configuration error. Please check your Client ID.');
            return false;
        }

        // Store state for verification
        sessionStorage.setItem('youtube_oauth_state', state);

        // Build OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', this.clientId);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', scope);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('access_type', 'offline');
        authUrl.searchParams.set('prompt', 'consent');

        console.log('🔗 Redirecting to OAuth URL:', authUrl.toString());

        // Redirect to Google OAuth
        window.location.href = authUrl.toString();
        return false; // Will redirect, so return false for now
    }

    // Handle OAuth callback
    async handleOAuthCallback(): Promise<boolean> {
        try {
            console.log('🔄 Handling OAuth callback...');

            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');
            const storedState = sessionStorage.getItem('youtube_oauth_state');

            console.log('OAuth callback params:', { code: !!code, state, error, storedState });

            // Check for OAuth errors
            if (error) {
                console.error('OAuth error:', error);
                const errorDescription = urlParams.get('error_description') || 'Unknown error';
                throw new Error(`OAuth error: ${error} - ${errorDescription}`);
            }

            if (!code || !state || state !== storedState) {
                console.error('Invalid OAuth callback - missing or invalid parameters');
                console.error('Code present:', !!code);
                console.error('State match:', state === storedState);
                return false;
            }

            console.log('✅ OAuth callback parameters validated');

            // Exchange code for token
            console.log('🔄 Exchanging authorization code for access token...');
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: window.location.origin + '/auth/youtube/callback'
                })
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error('Token exchange failed:', tokenResponse.status, errorText);
                throw new Error(`Token exchange failed: ${tokenResponse.status} - ${errorText}`);
            }

            const tokenData = await tokenResponse.json();
            console.log('✅ Token exchange successful');

            if (tokenData.access_token) {
                this.accessToken = tokenData.access_token;

                // Store token with expiry
                const expiryTime = Date.now() + (tokenData.expires_in * 1000);
                localStorage.setItem('youtube_access_token', tokenData.access_token);
                localStorage.setItem('youtube_token_expiry', expiryTime.toString());

                // Clean up
                sessionStorage.removeItem('youtube_oauth_state');

                console.log('✅ YouTube authentication completed successfully');
                return true;
            }

            console.error('No access token in response');
            return false;
        } catch (error) {
            console.error('OAuth callback handling failed:', error);
            return false;
        }
    }

    // Upload video to YouTube
    async uploadVideo(
        file: File,
        metadata: YouTubeVideoMetadata,
        onProgress: (progress: UploadProgress) => void,
        lectureId?: string,
        autoSave: boolean = true
    ): Promise<YouTubeUploadResponse> {
        try {
            // Validate file
            this.validateVideoFile(file);

            // Check if user is authenticated
            if (!this.accessToken) {
                const authenticated = await this.authenticate();
                if (!authenticated) {
                    throw new Error('Authentication required to upload videos');
                }
            }

            // Check YouTube permissions
            await this.checkYouTubePermissions();

            // Use real YouTube upload
            return this.realUpload(file, metadata, onProgress, lectureId, autoSave);

        } catch (error) {
            console.error('YouTube upload failed:', error);
            throw error;
        }
    }

    // Validate video file before upload
    private validateVideoFile(file: File): void {
        // Check file type
        const allowedTypes = [
            'video/mp4',
            'video/avi',
            'video/mov',
            'video/wmv',
            'video/flv',
            'video/webm',
            'video/quicktime'
        ];

        if (!allowedTypes.includes(file.type)) {
            throw new Error(`Unsupported file type: ${file.type}. Supported types: ${allowedTypes.join(', ')}`);
        }

        // Check file size (YouTube limit is 128GB, but we'll set a reasonable limit)
        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
        if (file.size > maxSize) {
            throw new Error(`File too large: ${(file.size / 1024 / 1024 / 1024).toFixed(2)}GB. Maximum size: 2GB`);
        }

        // Check minimum file size
        const minSize = 1024; // 1KB
        if (file.size < minSize) {
            throw new Error('File too small. Please select a valid video file.');
        }
    }

    // Check if user has necessary YouTube permissions
    private async checkYouTubePermissions(): Promise<void> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Check if user has YouTube upload permissions
            const response = await window.gapi.client.youtube.channels.list({
                part: 'contentDetails',
                mine: true
            });

            if (!response.result.items || response.result.items.length === 0) {
                throw new Error('No YouTube channel found. Please ensure you have a YouTube channel.');
            }

            console.log('✅ YouTube permissions verified');
        } catch (error) {
            console.error('❌ YouTube permissions check failed:', error);
            throw new Error('Failed to verify YouTube permissions. Please ensure you have a YouTube channel and the necessary permissions.');
        }
    }

    // Real YouTube video upload using YouTube Data API v3
    private async realUpload(
        file: File,
        metadata: YouTubeVideoMetadata,
        onProgress: (progress: UploadProgress) => void,
        lectureId?: string,
        autoSave: boolean = true
    ): Promise<YouTubeUploadResponse> {
        try {
            console.log('🎬 Starting real YouTube upload for:', metadata.title);

            // Check if we have access token
            if (!this.accessToken) {
                throw new Error('No access token available for YouTube upload');
            }

            // Initialize GAPI if not already done
            if (!this.isInitialized) {
                const initialized = await this.initialize();
                if (!initialized) {
                    throw new Error('Failed to initialize YouTube API');
                }
            }

            // Use the fetch-based upload method for better control and progress tracking
            return await this.uploadWithFetch(file, metadata, onProgress, lectureId, autoSave);

        } catch (error) {
            console.error('❌ Real upload failed:', error);
            throw error;
        }
    }

    // Alternative upload method using fetch API for better progress tracking
    private async uploadWithFetch(
        file: File,
        metadata: YouTubeVideoMetadata,
        onProgress: (progress: UploadProgress) => void,
        lectureId?: string,
        autoSave: boolean = true
    ): Promise<YouTubeUploadResponse> {
        try {
            console.log('🎬 Starting YouTube upload with fetch API');

            // Step 1: Create the video resource
            const videoResource = {
                snippet: {
                    title: metadata.title,
                    description: metadata.description,
                    tags: metadata.tags,
                    categoryId: '22' // People & Blogs category
                },
                status: {
                    privacyStatus: metadata.privacy,
                    selfDeclaredMadeForKids: false
                }
            };

            onProgress({
                percentage: 10,
                status: 'uploading',
                message: 'Creating video resource...'
            });

            // Step 2: Initialize the resumable upload
            const initUrl = `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status`;

            console.log('🔄 Initializing resumable upload...');
            const initResponse = await fetch(initUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json',
                    'X-Upload-Content-Type': file.type,
                    'X-Upload-Content-Length': file.size.toString()
                },
                body: JSON.stringify(videoResource)
            });

            if (!initResponse.ok) {
                const errorText = await initResponse.text();
                console.error('❌ Upload initialization failed:', initResponse.status, errorText);
                throw new Error(`Failed to initialize upload: ${initResponse.status} - ${errorText}`);
            }

            const location = initResponse.headers.get('Location');
            if (!location) {
                throw new Error('No upload location received from YouTube');
            }

            console.log('✅ Upload initialized, location:', location);

            onProgress({
                percentage: 20,
                status: 'uploading',
                message: 'Upload initialized, starting file transfer...'
            });

            // Step 3: Upload the file with progress tracking
            const uploadResponse = await this.uploadFileWithProgress(location, file, onProgress);

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('❌ File upload failed:', uploadResponse.status, errorText);
                throw new Error(`Upload failed: ${uploadResponse.status} - ${errorText}`);
            }

            const uploadResult = await uploadResponse.json();
            console.log('✅ YouTube upload successful:', uploadResult);

            const videoId = uploadResult.id;
            const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

            onProgress({
                percentage: 100,
                status: 'complete',
                message: 'Upload completed successfully!'
            });

            // Save to backend if lectureId is provided and autoSave is enabled
            if (lectureId && autoSave) {
                console.log('🎥 Saving video to backend for lecture:', lectureId);
                try {
                    await this.saveVideoToBackend(lectureId, {
                        youtubeUrl: videoUrl,
                        title: metadata.title,
                        description: metadata.description,
                        videoId: videoId
                    });
                    console.log('✅ Video saved to backend successfully');
                } catch (error) {
                    console.error('❌ Failed to save video to backend:', error);
                    // Don't throw error here, just log it
                }
            } else if (!lectureId) {
                console.log('⚠️ No lectureId provided, skipping backend save');
            } else if (!autoSave) {
                console.log('⚠️ Auto-save disabled, skipping backend save');
            }

            return {
                videoId: videoId,
                videoUrl: videoUrl,
                title: metadata.title,
                description: metadata.description,
                thumbnailUrl: uploadResult.snippet?.thumbnails?.default?.url || ''
            };

        } catch (error) {
            console.error('❌ Upload with fetch failed:', error);

            // Provide more specific error messages
            if (error instanceof Error) {
                if (error.message.includes('quota')) {
                    throw new Error('YouTube API quota exceeded. Please try again later.');
                } else if (error.message.includes('unauthorized')) {
                    throw new Error('YouTube authentication expired. Please re-authenticate.');
                } else if (error.message.includes('forbidden')) {
                    throw new Error('You do not have permission to upload videos to YouTube.');
                } else if (error.message.includes('invalid_grant')) {
                    throw new Error('YouTube authentication is invalid. Please re-authenticate.');
                }
            }

            throw error;
        }
    }

    // Helper method to upload file with progress tracking
    private async uploadFileWithProgress(
        uploadUrl: string,
        file: File,
        onProgress: (progress: UploadProgress) => void
    ): Promise<Response> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const percentage = Math.round((event.loaded / event.total) * 100);
                    onProgress({
                        percentage: Math.min(percentage, 95), // Leave 5% for processing
                        status: 'uploading',
                        message: `Uploading... ${percentage}%`
                    });
                }
            });

            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Create a proper Response object with the response text
                    const response = new Response(xhr.responseText, {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        })
                    });
                    resolve(response);
                } else {
                    reject(new Error(`Upload failed with status: ${xhr.status} - ${xhr.statusText}`));
                }
            });

            xhr.addEventListener('error', () => {
                reject(new Error('Upload failed due to network error'));
            });

            xhr.addEventListener('abort', () => {
                reject(new Error('Upload was aborted'));
            });

            xhr.open('PUT', uploadUrl);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.send(file);
        });
    }

    // Get video details
    async getVideoDetails(videoId: string): Promise<any> {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const response = await window.gapi.client.youtube.videos.list({
                part: 'snippet,statistics',
                id: videoId
            });

            return response.result.items?.[0] || null;
        } catch (error) {
            console.error('Failed to get video details:', error);
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated(): boolean {
        // Check if we have a valid token
        if (!this.accessToken) {
            return false;
        }

        // Check if token is expired
        const tokenExpiry = localStorage.getItem('youtube_token_expiry');
        if (tokenExpiry && Date.now() >= parseInt(tokenExpiry)) {
            // Token is expired, clear it
            this.accessToken = null;
            localStorage.removeItem('youtube_access_token');
            localStorage.removeItem('youtube_token_expiry');
            return false;
        }

        return true;
    }

    // Test API credentials without authentication
    async testCredentials(): Promise<boolean> {
        try {
            console.log('🧪 Testing YouTube API credentials...');

            // Test with a simple API call that doesn't require authentication
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${this.apiKey}&maxResults=1`);

            if (response.ok) {
                console.log('✅ YouTube API credentials are valid');
                return true;
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('❌ YouTube API credentials test failed:', response.status, errorData);
                return false;
            }
        } catch (error) {
            console.error('❌ YouTube API credentials test error:', error);
            return false;
        }
    }

    // Sign out
    signOut(): void {
        this.accessToken = null;
        // Note: Google Identity Services doesn't require explicit sign out
        // The token will expire naturally
    }

    // Save video information to backend
    private async saveVideoToBackend(lectureId: string, videoData: {
        youtubeUrl: string;
        title: string;
        description: string;
        videoId: string;
    }): Promise<void> {
        try {
            console.log('🔄 Calling backend API with data:', { lectureId, videoData });

            // Import the API function dynamically to avoid circular dependencies
            const { courseApi } = await import('./api');

            const response = await courseApi.saveYouTubeVideo(lectureId, videoData);
            console.log('✅ Backend API response:', response.data);
        } catch (error) {
            console.error('❌ Backend API error:', error);
            console.error('Error details:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Export singleton instance
export const youtubeAPI = new YouTubeAPI();

// Export types
export type { YouTubeVideoMetadata, YouTubeUploadResponse, UploadProgress };
