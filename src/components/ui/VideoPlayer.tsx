import React from 'react';
import { YouTubeVideoPlayer } from './YouTubeVideoPlayer';

interface VideoPlayerProps {
    youtubeUrl?: string;
    youtubeVideoId?: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({
    youtubeUrl,
    youtubeVideoId,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: VideoPlayerProps) {
    // Only support YouTube videos
    if (youtubeUrl || youtubeVideoId) {
        return (
            <YouTubeVideoPlayer
                youtubeUrl={youtubeUrl}
                youtubeVideoId={youtubeVideoId}
                className={className}
                onEnded={onEnded}
                onPlay={onPlay}
                onPause={onPause}
                onTimeUpdate={onTimeUpdate}
            />
        );
    }

    // No video available
    return (
        <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
            <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📹</div>
                <p>No YouTube video available</p>
            </div>
        </div>
    );
}
