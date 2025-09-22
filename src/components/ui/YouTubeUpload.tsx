import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Textarea } from './textarea';
import { ProgressBar } from './progress-bar';
import { Upload, X, CheckCircle, AlertCircle, Youtube, Lock } from 'lucide-react';
import { youtubeAPI, type YouTubeVideoMetadata, type UploadProgress } from '@/lib/youtubeApi';
import { useAuth } from '@/context/AuthContext';

interface YouTubeUploadProps {
    onVideoUploaded: (videoId: string, videoUrl: string, title: string) => void;
    className?: string;
    disabled?: boolean;
    lectureId?: string; // Optional lecture ID to save video to backend
    autoSave?: boolean; // Whether to automatically save to backend (default: true)
}

interface LocalUploadProgress {
    percentage: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
}

export const YouTubeUpload: React.FC<YouTubeUploadProps> = ({
    onVideoUploaded,
    className,
    disabled = false,
    lectureId,
    autoSave = true
}) => {
    const { user } = useAuth();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState<LocalUploadProgress>({
        percentage: 0,
        status: 'idle'
    });
    const [videoMetadata, setVideoMetadata] = useState<YouTubeVideoMetadata>({
        title: '',
        description: '',
        tags: [],
        privacy: 'unlisted'
    });
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize YouTube API on component mount
    useEffect(() => {
        const initYouTube = async () => {
            try {
                const success = await youtubeAPI.initialize();
                setIsInitialized(success);

                // Check if we're returning from OAuth callback
                if (window.location.pathname === '/auth/youtube/callback') {
                    console.log('🔄 Handling OAuth callback...');
                    const authSuccess = await youtubeAPI.handleOAuthCallback();
                    console.log('✅ OAuth callback result:', authSuccess);
                    setIsAuthenticated(authSuccess);
                } else {
                    // Check for existing valid token (API now handles loading internally)
                    const hasValidToken = youtubeAPI.isAuthenticated();
                    console.log('🔍 Authentication check result:', hasValidToken);
                    console.log('🔍 Stored token exists:', !!localStorage.getItem('youtube_access_token'));
                    console.log('🔍 Token expiry:', localStorage.getItem('youtube_token_expiry'));
                    setIsAuthenticated(hasValidToken);
                }
            } catch (error) {
                console.error('Failed to initialize YouTube API:', error);
                setIsInitialized(false);
                setIsAuthenticated(false);
            }
        };

        initYouTube();
    }, []);

    const handleAuthenticate = async () => {
        if (!user) {
            // Show message to login
            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: 'Please log in to upload videos to YouTube'
            });
            return;
        }

        try {
            setUploadProgress({
                percentage: 0,
                status: 'uploading',
                message: 'Redirecting to YouTube authentication...'
            });

            console.log('🔄 Starting YouTube authentication...');

            // This will redirect to Google OAuth
            const authSuccess = await youtubeAPI.authenticate();

            console.log('🔄 Authentication result:', authSuccess);

            // If we get here, it means we have a stored token
            if (authSuccess) {
                setIsAuthenticated(true);
                setUploadProgress({
                    percentage: 0,
                    status: 'success',
                    message: 'Successfully authenticated with YouTube!'
                });
            } else {
                // This means we're being redirected to OAuth
                setUploadProgress({
                    percentage: 0,
                    status: 'uploading',
                    message: 'Redirecting to YouTube...'
                });
            }
        } catch (error) {
            console.error('YouTube authentication failed:', error);
            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: 'Authentication failed. Please try again.'
            });
        }
    };

    // Refresh authentication state
    const refreshAuthState = () => {
        const apiAuthStatus = youtubeAPI.isAuthenticated();
        console.log('🔄 Refreshing auth state - API status:', apiAuthStatus);
        setIsAuthenticated(apiAuthStatus);
    };

    // Periodically check authentication state
    useEffect(() => {
        const interval = setInterval(() => {
            const apiAuthStatus = youtubeAPI.isAuthenticated();
            if (apiAuthStatus !== isAuthenticated) {
                console.log('🔄 Auth state changed, updating:', apiAuthStatus);
                setIsAuthenticated(apiAuthStatus);
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Check if it's a video file
            if (!file.type.startsWith('video/')) {
                setUploadProgress({
                    percentage: 0,
                    status: 'error',
                    message: 'Please select a video file'
                });
                return;
            }

            // Check file size (YouTube has a 256GB limit, but we'll set a reasonable limit)
            const maxSize = 5 * 1024 * 1024 * 1024; // 5GB
            if (file.size > maxSize) {
                setUploadProgress({
                    percentage: 0,
                    status: 'error',
                    message: 'File size too large. Maximum size is 5GB'
                });
                return;
            }

            setSelectedFile(file);
            setUploadProgress({ percentage: 0, status: 'idle' });

            // Auto-fill title if empty
            if (!videoMetadata.title) {
                setVideoMetadata(prev => ({
                    ...prev,
                    title: file.name.replace(/\.[^/.]+$/, '') // Remove file extension
                }));
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !isInitialized) return;

        console.log('🎬 Upload attempt - State check:');
        console.log('  - User:', !!user);
        console.log('  - IsInitialized:', isInitialized);
        console.log('  - IsAuthenticated (state):', isAuthenticated);
        console.log('  - IsAuthenticated (API):', youtubeAPI.isAuthenticated());
        console.log('  - Access token exists:', !!localStorage.getItem('youtube_access_token'));

        // Check authentication before upload
        if (!user) {
            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: 'Please log in to upload videos to YouTube'
            });
            return;
        }

        // Double-check authentication with API
        const apiAuthStatus = youtubeAPI.isAuthenticated();
        if (!apiAuthStatus) {
            console.log('❌ API authentication check failed, updating state');
            setIsAuthenticated(false);
            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: 'Please authenticate with YouTube to upload videos'
            });
            return;
        }

        // Validate metadata
        if (!videoMetadata.title.trim()) {
            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: 'Please enter a video title'
            });
            return;
        }

        setUploadProgress({
            percentage: 0,
            status: 'uploading',
            message: 'Preparing upload...'
        });

        try {
            // Prepare metadata for YouTube API
            const metadata: YouTubeVideoMetadata = {
                title: videoMetadata.title.trim(),
                description: videoMetadata.description.trim(),
                tags: videoMetadata.tags.filter(tag => tag.trim() !== ''),
                privacy: videoMetadata.privacy
            };

            console.log('🎬 Starting YouTube upload with metadata:', metadata);

            // Upload to YouTube using the API
            const response = await youtubeAPI.uploadVideo(
                selectedFile,
                metadata,
                (progress) => {
                    setUploadProgress({
                        percentage: progress.percentage,
                        status: progress.status === 'complete' ? 'success' : 'uploading',
                        message: progress.message
                    });
                },
                lectureId, // Pass lectureId to save video to backend
                autoSave // Pass autoSave flag
            );

            setUploadProgress({
                percentage: 100,
                status: 'success',
                message: `Video "${response.title}" uploaded successfully to YouTube!`
            });

            // Call the callback with the uploaded video details
            onVideoUploaded(response.videoId, response.videoUrl, response.title);

            // Reset form
            setSelectedFile(null);
            setVideoMetadata({
                title: '',
                description: '',
                tags: [],
                privacy: 'unlisted'
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Upload failed:', error);

            let errorMessage = 'Upload failed. Please try again.';

            if (error instanceof Error) {
                if (error.message.includes('quota')) {
                    errorMessage = 'YouTube API quota exceeded. Please try again later.';
                } else if (error.message.includes('unauthorized')) {
                    errorMessage = 'YouTube authentication expired. Please re-authenticate.';
                } else if (error.message.includes('forbidden')) {
                    errorMessage = 'You do not have permission to upload videos to YouTube.';
                } else if (error.message.includes('invalid_grant')) {
                    errorMessage = 'YouTube authentication is invalid. Please re-authenticate.';
                } else if (error.message.includes('Environment validation failed')) {
                    errorMessage = 'YouTube API configuration error. Please check your settings.';
                } else if (error.message.includes('No access token available')) {
                    errorMessage = 'YouTube authentication required. Please authenticate first.';
                } else {
                    errorMessage = error.message;
                }
            }

            setUploadProgress({
                percentage: 0,
                status: 'error',
                message: errorMessage
            });
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setUploadProgress({ percentage: 0, status: 'idle' });
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={className}>
            {!selectedFile ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={disabled || !user || !isAuthenticated}
                    />
                    <label
                        onClick={() => {
                            if (!user) {
                                setUploadProgress({
                                    percentage: 0,
                                    status: 'error',
                                    message: 'Please log in to upload videos to YouTube'
                                });
                                return;
                            }
                            if (!isAuthenticated) {
                                handleAuthenticate();
                                return;
                            }
                            fileInputRef.current?.click();
                        }}
                        className={`flex flex-col items-center space-y-2 ${!user || !isAuthenticated ? 'cursor-pointer' : 'cursor-pointer'
                            }`}
                    >
                        <Youtube className="h-8 w-8 text-red-500" />
                        <div className="text-sm text-gray-600">
                            {!user ? (
                                <span className="font-medium text-blue-600 hover:text-blue-500">
                                    Login Required to Upload to YouTube
                                </span>
                            ) : !isAuthenticated ? (
                                <span className="font-medium text-orange-600 hover:text-orange-500">
                                    Authenticate with YouTube
                                </span>
                            ) : (
                                <span className="font-medium text-red-600 hover:text-red-500">
                                    Upload to YouTube
                                </span>
                            )}
                            {' '}or drag and drop
                        </div>
                        <div className="text-xs text-gray-500">
                            {!user ? (
                                'Please log in to upload videos'
                            ) : !isAuthenticated ? (
                                'Click to authenticate with YouTube'
                            ) : (
                                'Max size: 5GB • Supported formats: MP4, MOV, AVI, WMV, FLV'
                            )}
                        </div>
                        {!user && (
                            <div className="flex items-center gap-2 text-xs text-blue-600 mt-2">
                                <Lock className="h-3 w-3" />
                                <span>Authentication required</span>
                            </div>
                        )}
                    </label>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* File Info */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                                {uploadProgress.status === 'success' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : uploadProgress.status === 'error' ? (
                                    <AlertCircle className="h-5 w-5 text-red-500" />
                                ) : (
                                    <Youtube className="h-5 w-5 text-red-500" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {selectedFile.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {formatFileSize(selectedFile.size)}
                                </p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            disabled={uploadProgress.status === 'uploading'}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Video Metadata Form */}
                    {uploadProgress.status === 'idle' && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900">Video Details</h4>

                            <div>
                                <Label htmlFor="video-title" className="text-xs text-gray-600">
                                    Title *
                                </Label>
                                <Input
                                    id="video-title"
                                    value={videoMetadata.title}
                                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Enter video title"
                                    className="mt-1"
                                    required
                                />
                            </div>

                            <div>
                                <Label htmlFor="video-description" className="text-xs text-gray-600">
                                    Description
                                </Label>
                                <Textarea
                                    id="video-description"
                                    value={videoMetadata.description}
                                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Enter video description"
                                    className="mt-1"
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="video-tags" className="text-xs text-gray-600">
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    id="video-tags"
                                    value={videoMetadata.tags.join(', ')}
                                    onChange={(e) => setVideoMetadata(prev => ({
                                        ...prev,
                                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
                                    }))}
                                    placeholder="course, tutorial, education"
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <Label htmlFor="video-privacy" className="text-xs text-gray-600">
                                    Privacy
                                </Label>
                                <select
                                    id="video-privacy"
                                    value={videoMetadata.privacy}
                                    onChange={(e) => setVideoMetadata(prev => ({ ...prev, privacy: e.target.value as any }))}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                >
                                    <option value="unlisted">Unlisted (recommended for courses)</option>
                                    <option value="private">Private</option>
                                    <option value="public">Public</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Upload Progress */}
                    {uploadProgress.status === 'uploading' && (
                        <div className="space-y-2">
                            <ProgressBar progress={uploadProgress.percentage} size="md" />
                            <p className="text-xs text-gray-600 text-center">
                                Uploading to YouTube... {uploadProgress.percentage}%
                            </p>
                        </div>
                    )}

                    {/* Upload Button */}
                    {uploadProgress.status === 'idle' && (
                        <Button
                            onClick={handleUpload}
                            disabled={disabled || !videoMetadata.title.trim() || !isInitialized || !user || !isAuthenticated}
                            className="w-full bg-red-600 hover:bg-red-700"
                        >
                            <Youtube className="h-4 w-4 mr-2" />
                            {!isInitialized ? 'Initializing...' :
                                !user ? 'Login Required' :
                                    !isAuthenticated ? 'Authenticate Required' :
                                        'Upload to YouTube'}
                        </Button>
                    )}

                    {/* Authentication Status */}
                    {!user && (
                        <div className="text-center text-blue-600 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <Lock className="h-4 w-4" />
                                <span>Please log in to upload videos to YouTube</span>
                            </div>
                        </div>
                    )}

                    {user && !isAuthenticated && (
                        <div className="text-center text-orange-600 text-sm">
                            <div className="flex items-center justify-center gap-2">
                                <Youtube className="h-4 w-4" />
                                <span>Please authenticate with YouTube to upload videos</span>
                            </div>
                            <Button
                                onClick={refreshAuthState}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                            >
                                Refresh Auth State
                            </Button>
                        </div>
                    )}

                    {/* Initialization Error */}
                    {!isInitialized && (
                        <div className="text-center text-red-600 text-sm">
                            Failed to initialize YouTube API. Please check your configuration.
                        </div>
                    )}

                    {/* Success Message */}
                    {uploadProgress.status === 'success' && (
                        <div className="text-center text-green-600 text-sm">
                            {uploadProgress.message}
                        </div>
                    )}

                    {/* Error Message */}
                    {uploadProgress.status === 'error' && (
                        <div className="text-center text-red-600 text-sm">
                            {uploadProgress.message || 'Upload failed. Please try again.'}
                        </div>
                    )}

                    {/* Debug Panel - Remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                            <div className="font-semibold mb-2">Debug Info:</div>
                            <div>User: {user ? '✅' : '❌'}</div>
                            <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
                            <div>Authenticated (State): {isAuthenticated ? '✅' : '❌'}</div>
                            <div>Authenticated (API): {youtubeAPI.isAuthenticated() ? '✅' : '❌'}</div>
                            <div>Token Exists: {localStorage.getItem('youtube_access_token') ? '✅' : '❌'}</div>
                            <div>Token Expiry: {localStorage.getItem('youtube_token_expiry') || 'None'}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

