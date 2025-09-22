import React, { useRef, useEffect } from 'react';
import { YouTubePlayer, detectVideoType, extractYouTubeVideoId } from './YouTubePlayer';

interface UniversalVideoPlayerProps {
    videoUrl?: string;
    videoFile?: string;
    videoType?: 'youtube' | 'vimeo' | 'uploaded' | 'external';
    youtubeVideoId?: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

export function UniversalVideoPlayer({
    videoUrl,
    videoFile,
    videoType,
    youtubeVideoId,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: UniversalVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Determine the actual video type and source
    const actualVideoType = videoType || (videoUrl ? detectVideoType(videoUrl) : 'uploaded');
    const actualYoutubeVideoId = youtubeVideoId || (videoUrl ? extractYouTubeVideoId(videoUrl) : null);

    // Handle video events for HTML5 video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => onPlay?.();
        const handlePause = () => onPause?.();
        const handleEnded = () => onEnded?.();
        const handleTimeUpdate = () => onTimeUpdate?.(video.currentTime);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('ended', handleEnded);
        video.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('ended', handleEnded);
            video.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, [onPlay, onPause, onEnded, onTimeUpdate]);

    // Render appropriate player based on video type
    if (actualVideoType === 'youtube' && actualYoutubeVideoId) {
        return (
            <YouTubePlayer
                videoId={actualYoutubeVideoId}
                className={className}
                onEnded={onEnded}
                onPlay={onPlay}
                onPause={onPause}
                onTimeUpdate={onTimeUpdate}
            />
        );
    }

    if (actualVideoType === 'vimeo' && videoUrl) {
        // Extract Vimeo video ID
        const vimeoId = videoUrl.match(/vimeo\.com\/(\d+)/)?.[1];
        if (vimeoId) {
            return (
                <div className={className}>
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0&fs=1&playsinline=1`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title="Vimeo video player"
                    />
                </div>
            );
        }
    }

    // Default to HTML5 video for uploaded files or external URLs
    const videoSrc = videoFile
        ? `${import.meta.env.VITE_BACKEND_URL}${videoFile}`
        : videoUrl;

    if (!videoSrc) {
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📹</div>
                    <p>No video available</p>
                </div>
            </div>
        );
    }

    return (
        <video
            ref={videoRef}
            src={videoSrc}
            className={className}
            controls
            preload="metadata"
            playsInline
        />
    );
}
