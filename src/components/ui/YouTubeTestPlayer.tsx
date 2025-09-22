import React from 'react';
import { VideoPlayer } from './VideoPlayer';

// Test component to verify YouTube player functionality
export function YouTubeTestPlayer() {
    const testVideoId = 'dQw4w9WgXcQ'; // Rick Astley - Never Gonna Give You Up (known working video)
    const testUrl = `https://www.youtube.com/watch?v=${testVideoId}`;

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">YouTube Embed Player Test</h2>
            <p className="text-gray-600 mb-6">Testing the new iframe-based YouTube player implementation</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">Test with Video ID:</h3>
                    <p className="text-sm text-gray-500 mb-2">Video ID: {testVideoId}</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer
                            youtubeVideoId={testVideoId}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Test with YouTube URL:</h3>
                    <p className="text-sm text-gray-500 mb-2">URL: {testUrl}</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer
                            youtubeUrl={testUrl}
                            className="w-full h-full"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Test with No Video (fallback):</h3>
                    <p className="text-sm text-gray-500 mb-2">Should show "No video available" message</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer
                            className="w-full h-full"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="text-lg font-semibold mb-2">Test with Invalid URL:</h3>
                    <p className="text-sm text-gray-500 mb-2">Should show "Invalid YouTube URL" message</p>
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <VideoPlayer
                            youtubeUrl="https://invalid-url.com"
                            className="w-full h-full"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">How to Test:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Check browser console for debug logs</li>
                    <li>• Verify videos load and play correctly</li>
                    <li>• Test fullscreen functionality</li>
                    <li>• Check responsive behavior on different screen sizes</li>
                </ul>
            </div>
        </div>
    );
}
