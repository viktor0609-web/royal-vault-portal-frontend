import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { youtubeAPI } from '@/lib/youtubeApi';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function YouTubeCallback() {
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing authentication...');

    useEffect(() => {
        const handleCallback = async () => {
            try {
                setMessage('Exchanging authorization code for access token...');

                const success = await youtubeAPI.handleOAuthCallback();

                if (success) {
                    setStatus('success');
                    setMessage('Successfully authenticated with YouTube! Redirecting...');

                    // Redirect back to the previous page or admin dashboard
                    setTimeout(() => {
                        navigate('/admin/courses', { replace: true });
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage('Authentication failed. Please try again.');

                    setTimeout(() => {
                        navigate('/admin/courses', { replace: true });
                    }, 3000);
                }
            } catch (error) {
                console.error('Callback handling error:', error);
                setStatus('error');
                setMessage('An error occurred during authentication.');

                setTimeout(() => {
                    navigate('/admin/courses', { replace: true });
                }, 3000);
            }
        };

        handleCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                <div className="mb-6">
                    {status === 'loading' && (
                        <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
                    )}
                    {status === 'success' && (
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                    )}
                    {status === 'error' && (
                        <XCircle className="h-16 w-16 text-red-500 mx-auto" />
                    )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    {status === 'loading' && 'Authenticating with YouTube'}
                    {status === 'success' && 'Authentication Successful'}
                    {status === 'error' && 'Authentication Failed'}
                </h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                {status === 'loading' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            Please wait while we complete the authentication process...
                        </p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-800">
                            You can now upload videos to YouTube. You will be redirected shortly.
                        </p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-800">
                            There was a problem with the authentication. You will be redirected to try again.
                        </p>
                    </div>
                )}

                <div className="mt-6">
                    <button
                        onClick={() => navigate('/admin/courses')}
                        className="text-blue-600 hover:text-blue-500 font-medium"
                    >
                        Return to Admin Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
