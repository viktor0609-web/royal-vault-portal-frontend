// YouTube API Diagnostics Utility
// This helps identify common issues with YouTube API integration

export interface DiagnosticResult {
    test: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: any;
}

export class YouTubeDiagnostics {
    private results: DiagnosticResult[] = [];

    async runAllDiagnostics(): Promise<DiagnosticResult[]> {
        this.results = [];

        await this.testEnvironmentVariables();
        await this.testNetworkConnectivity();
        await this.testGoogleAPIScripts();
        await this.testYouTubeAPIAccess();

        return this.results;
    }

    private async testEnvironmentVariables(): Promise<void> {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_YOUTUBE_CLIENT_SECRET;

        if (!apiKey || apiKey === 'your_youtube_api_key_here') {
            this.results.push({
                test: 'Environment Variables - API Key',
                status: 'fail',
                message: 'YouTube API Key is missing or not configured',
                details: { apiKey: apiKey ? 'Present but placeholder' : 'Missing' }
            });
        } else {
            this.results.push({
                test: 'Environment Variables - API Key',
                status: 'pass',
                message: 'YouTube API Key is configured',
                details: { apiKey: `${apiKey.substring(0, 10)}...` }
            });
        }

        if (!clientId || clientId === 'your_youtube_client_id_here') {
            this.results.push({
                test: 'Environment Variables - Client ID',
                status: 'fail',
                message: 'YouTube Client ID is missing or not configured',
                details: { clientId: clientId ? 'Present but placeholder' : 'Missing' }
            });
        } else if (!clientId.includes('.apps.googleusercontent.com')) {
            this.results.push({
                test: 'Environment Variables - Client ID',
                status: 'fail',
                message: 'YouTube Client ID format is invalid',
                details: { clientId: `${clientId.substring(0, 20)}...` }
            });
        } else {
            this.results.push({
                test: 'Environment Variables - Client ID',
                status: 'pass',
                message: 'YouTube Client ID is configured correctly',
                details: { clientId: `${clientId.substring(0, 20)}...` }
            });
        }

        if (!clientSecret || clientSecret === 'your_youtube_client_secret_here') {
            this.results.push({
                test: 'Environment Variables - Client Secret',
                status: 'fail',
                message: 'YouTube Client Secret is missing or not configured',
                details: { clientSecret: clientSecret ? 'Present but placeholder' : 'Missing' }
            });
        } else {
            this.results.push({
                test: 'Environment Variables - Client Secret',
                status: 'pass',
                message: 'YouTube Client Secret is configured',
                details: { clientSecret: `${clientSecret.substring(0, 10)}...` }
            });
        }
    }

    private async testNetworkConnectivity(): Promise<void> {
        try {
            const response = await fetch('https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=test&maxResults=1');

            if (response.status === 400) {
                // 400 is expected with invalid key, means we can reach the API
                this.results.push({
                    test: 'Network Connectivity',
                    status: 'pass',
                    message: 'Can reach YouTube API endpoints',
                    details: { status: response.status }
                });
            } else {
                this.results.push({
                    test: 'Network Connectivity',
                    status: 'warning',
                    message: 'Unexpected response from YouTube API',
                    details: { status: response.status }
                });
            }
        } catch (error) {
            this.results.push({
                test: 'Network Connectivity',
                status: 'fail',
                message: 'Cannot reach YouTube API endpoints',
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    }

    private async testGoogleAPIScripts(): Promise<void> {
        // Check if Google Identity Services is available
        if (typeof window !== 'undefined') {
            if (window.google) {
                this.results.push({
                    test: 'Google Identity Services',
                    status: 'pass',
                    message: 'Google Identity Services is loaded',
                    details: { available: true }
                });
            } else {
                this.results.push({
                    test: 'Google Identity Services',
                    status: 'warning',
                    message: 'Google Identity Services not loaded yet',
                    details: { available: false }
                });
            }

            if (window.gapi) {
                this.results.push({
                    test: 'Google API Client',
                    status: 'pass',
                    message: 'Google API Client is loaded',
                    details: { available: true }
                });
            } else {
                this.results.push({
                    test: 'Google API Client',
                    status: 'warning',
                    message: 'Google API Client not loaded yet',
                    details: { available: false }
                });
            }
        } else {
            this.results.push({
                test: 'Browser Environment',
                status: 'fail',
                message: 'Not running in browser environment',
                details: { window: typeof window }
            });
        }
    }

    private async testYouTubeAPIAccess(): Promise<void> {
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;

        if (!apiKey || apiKey === 'your_youtube_api_key_here') {
            this.results.push({
                test: 'YouTube API Access',
                status: 'fail',
                message: 'Cannot test API access without valid API key',
                details: { reason: 'No API key configured' }
            });
            return;
        }

        try {
            const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=test&key=${apiKey}&maxResults=1`);

            if (response.ok) {
                const data = await response.json();
                this.results.push({
                    test: 'YouTube API Access',
                    status: 'pass',
                    message: 'YouTube API access is working',
                    details: {
                        status: response.status,
                        itemsFound: data.items?.length || 0
                    }
                });
            } else {
                const errorData = await response.json().catch(() => ({}));
                this.results.push({
                    test: 'YouTube API Access',
                    status: 'fail',
                    message: 'YouTube API access failed',
                    details: {
                        status: response.status,
                        error: errorData.error || 'Unknown error'
                    }
                });
            }
        } catch (error) {
            this.results.push({
                test: 'YouTube API Access',
                status: 'fail',
                message: 'YouTube API access test failed',
                details: { error: error instanceof Error ? error.message : 'Unknown error' }
            });
        }
    }

    getResults(): DiagnosticResult[] {
        return this.results;
    }

    getSummary(): { total: number; passed: number; failed: number; warnings: number } {
        const total = this.results.length;
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warning').length;

        return { total, passed, failed, warnings };
    }
}

export const youtubeDiagnostics = new YouTubeDiagnostics();
