import React from 'react';

interface VideoPlayerProps {
    videoUrl?: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

export function VideoPlayer({
    videoUrl,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: VideoPlayerProps) {
    // Support regular video URLs
    if (videoUrl) {
        return (
            <video
                className={className}
                controls
                onEnded={onEnded}
                onPlay={onPlay}
                onPause={onPause}
                onTimeUpdate={(e) => onTimeUpdate?.(e.currentTarget.currentTime)}
            >
                <source src={videoUrl} />
                Your browser does not support the video tag.
            </video>
        );
    }

    // No video available
    return (
        <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
            <div className="text-center text-gray-500">
                <div className="text-4xl mb-2">📹</div>
                <p>No video available</p>
            </div>
        </div>
    );
}
