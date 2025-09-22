import React, { useState, useEffect } from 'react';
import { youtubeAPI } from '@/lib/youtubeApi';
import { validateEnvironment } from '@/lib/envValidation';
import { youtubeDiagnostics } from '@/utils/youtubeDiagnostics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function YouTubeTest() {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [envValidation, setEnvValidation] = useState<any>(null);
    const [credentialsValid, setCredentialsValid] = useState<boolean | null>(null);
    const [diagnostics, setDiagnostics] = useState<any[]>([]);
    const [logs, setLogs] = useState<string[]>([]);

    const addLog = (message: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    };

    useEffect(() => {
        const initialize = async () => {
            addLog('🔧 Starting YouTube API initialization...');

            // Check environment validation
            const validation = validateEnvironment();
            setEnvValidation(validation);
            addLog(`Environment validation: ${validation.isValid ? '✅ PASSED' : '❌ FAILED'}`);

            if (!validation.isValid) {
                validation.errors.forEach(error => addLog(`❌ ${error}`));
                return;
            }

            // Initialize YouTube API
            const initialized = await youtubeAPI.initialize();
            setIsInitialized(initialized);
            addLog(`YouTube API initialization: ${initialized ? '✅ SUCCESS' : '❌ FAILED'}`);

            if (initialized) {
                const authenticated = youtubeAPI.isAuthenticated();
                setIsAuthenticated(authenticated);
                addLog(`Authentication status: ${authenticated ? '✅ AUTHENTICATED' : '❌ NOT AUTHENTICATED'}`);

                // Test credentials
                addLog('🧪 Testing YouTube API credentials...');
                const credentialsOk = await youtubeAPI.testCredentials();
                setCredentialsValid(credentialsOk);
                addLog(`Credentials test: ${credentialsOk ? '✅ VALID' : '❌ INVALID'}`);

                // Run diagnostics
                addLog('🔍 Running comprehensive diagnostics...');
                const diagnosticResults = await youtubeDiagnostics.runAllDiagnostics();
                setDiagnostics(diagnosticResults);
                addLog(`Diagnostics completed: ${diagnosticResults.length} tests run`);
            }
        };

        initialize();
    }, []);

    const handleAuthenticate = async () => {
        addLog('🔐 Starting YouTube authentication...');
        const authenticated = await youtubeAPI.authenticate();
        addLog(`Authentication result: ${authenticated ? '✅ SUCCESS' : '❌ FAILED'}`);
        setIsAuthenticated(authenticated);
    };

    const handleTestUpload = async () => {
        addLog('🎬 Testing YouTube upload (this will create a test file)...');

        // Check prerequisites
        if (!isInitialized) {
            addLog('❌ YouTube API not initialized');
            return;
        }

        if (!isAuthenticated) {
            addLog('❌ Not authenticated with YouTube');
            addLog('💡 Please click "Authenticate with YouTube" first');
            return;
        }

        if (credentialsValid === false) {
            addLog('❌ YouTube API credentials are invalid');
            return;
        }

        addLog('✅ All prerequisites met, creating test video...');

        // Create a small test video file
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Draw a simple test pattern
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, 160, 120);
            ctx.fillStyle = '#00ff00';
            ctx.fillRect(160, 0, 160, 120);
            ctx.fillStyle = '#0000ff';
            ctx.fillRect(0, 120, 160, 120);
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(160, 120, 160, 120);

            // Add text
            ctx.fillStyle = '#000000';
            ctx.font = '20px Arial';
            ctx.fillText('YouTube Test Video', 10, 200);
        }

        addLog('🎨 Canvas created, converting to video...');

        // Convert canvas to blob
        canvas.toBlob(async (blob) => {
            if (!blob) {
                addLog('❌ Failed to create test video blob');
                return;
            }

            const file = new File([blob], 'test-video.webm', { type: 'video/webm' });
            addLog(`✅ Created test video file: ${file.name} (${file.size} bytes)`);

            try {
                const metadata = {
                    title: 'YouTube API Test Video',
                    description: 'This is a test video uploaded via the Royal Vault Portal YouTube API integration.',
                    tags: ['test', 'api', 'royal-vault'],
                    privacy: 'unlisted' as const
                };

                addLog('🎬 Starting upload...');
                addLog('📋 Upload metadata:', JSON.stringify(metadata, null, 2));

                const response = await youtubeAPI.uploadVideo(
                    file,
                    metadata,
                    (progress) => {
                        addLog(`📊 Upload progress: ${progress.percentage}% - ${progress.message}`);
                    }
                );

                addLog(`✅ Upload successful! Video ID: ${response.videoId}`);
                addLog(`🔗 Video URL: ${response.videoUrl}`);
            } catch (error) {
                addLog(`❌ Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
                console.error('Upload error details:', error);
            }
        }, 'video/webm');
    };

    const handleTestCredentials = async () => {
        addLog('🧪 Testing YouTube API credentials...');
        try {
            const isValid = await youtubeAPI.testCredentials();
            setCredentialsValid(isValid);
            addLog(`Credentials test result: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
        } catch (error) {
            addLog(`❌ Credentials test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">YouTube API Test Page</h1>
                    <p className="text-gray-600">Debug and test YouTube video upload functionality</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Status Cards */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                Environment Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {envValidation ? (
                                <div className="space-y-2">
                                    <div className={`flex items-center gap-2 ${envValidation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                                        {envValidation.isValid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                        {envValidation.isValid ? 'All environment variables configured' : 'Configuration issues detected'}
                                    </div>
                                    {!envValidation.isValid && (
                                        <ul className="text-sm text-red-600 space-y-1">
                                            {envValidation.errors.map((error, index) => (
                                                <li key={index}>• {error}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Checking environment...
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5" />
                                API Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className={`flex items-center gap-2 ${isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                                    {isInitialized ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                    API Initialized: {isInitialized ? 'Yes' : 'No'}
                                </div>
                                <div className={`flex items-center gap-2 ${credentialsValid === true ? 'text-green-600' : credentialsValid === false ? 'text-red-600' : 'text-gray-500'}`}>
                                    {credentialsValid === true ? <CheckCircle className="h-4 w-4" /> : credentialsValid === false ? <XCircle className="h-4 w-4" /> : <Loader2 className="h-4 w-4 animate-spin" />}
                                    Credentials: {credentialsValid === true ? 'Valid' : credentialsValid === false ? 'Invalid' : 'Testing...'}
                                </div>
                                <div className={`flex items-center gap-2 ${isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {isAuthenticated ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                                    Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Action Buttons */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Actions</CardTitle>
                        <CardDescription>Test different aspects of the YouTube API integration</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <Button
                                    onClick={handleTestCredentials}
                                    disabled={!isInitialized}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Test Credentials
                                </Button>

                                <Button
                                    onClick={handleAuthenticate}
                                    disabled={!isInitialized || isAuthenticated}
                                    className="flex-1"
                                >
                                    {isAuthenticated ? 'Already Authenticated' : 'Authenticate with YouTube'}
                                </Button>
                            </div>

                            <Button
                                onClick={handleTestUpload}
                                disabled={!isInitialized || !isAuthenticated || credentialsValid === false}
                                className="w-full"
                            >
                                Test Upload
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Diagnostics */}
                {diagnostics.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>System Diagnostics</CardTitle>
                            <CardDescription>Detailed analysis of YouTube API integration</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {diagnostics.map((result, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {result.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500" />}
                                            {result.status === 'fail' && <XCircle className="h-5 w-5 text-red-500" />}
                                            {result.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-sm">{result.test}</div>
                                            <div className="text-sm text-gray-600">{result.message}</div>
                                            {result.details && (
                                                <details className="mt-2">
                                                    <summary className="text-xs text-gray-500 cursor-pointer">Details</summary>
                                                    <pre className="text-xs text-gray-500 mt-1 overflow-auto">
                                                        {JSON.stringify(result.details, null, 2)}
                                                    </pre>
                                                </details>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Logs */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Debug Logs</CardTitle>
                            <Button variant="outline" size="sm" onClick={clearLogs}>
                                Clear Logs
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
                            {logs.length === 0 ? (
                                <div className="text-gray-500">No logs yet...</div>
                            ) : (
                                logs.map((log, index) => (
                                    <div key={index} className="mb-1">{log}</div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
