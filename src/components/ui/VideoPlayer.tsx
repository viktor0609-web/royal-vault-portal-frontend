import React, { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
    videoUrl?: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

// Declare YouTube IFrame API types
declare global {
    interface Window {
        YT: {
            Player: new (elementId: string, config: {
                videoId: string;
                events?: {
                    onReady?: (event: any) => void;
                    onStateChange?: (event: any) => void;
                };
                playerVars?: {
                    enablejsapi?: number;
                    origin?: string;
                };
            }) => {
                destroy: () => void;
            };
            PlayerState: {
                ENDED: number;
                PLAYING: number;
                PAUSED: number;
            };

        };
        onYouTubeIframeAPIReady?: () => void;
    }
}

export function VideoPlayer({
    videoUrl,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: VideoPlayerProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const playerRef = useRef<any>(null);
    const [playerId] = useState(`youtube-player-${Math.random().toString(36).slice(2, 11)}`);
    const [apiReady, setApiReady] = useState(false);

    // Check if the URL is a YouTube video
    const isYouTube = videoUrl ? (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) : false;

    // Extract YouTube video ID for embedding
    const getYouTubeVideoId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    };

    const youtubeVideoId = videoUrl && isYouTube ? getYouTubeVideoId(videoUrl) : null;

    // Load YouTube IFrame API
    useEffect(() => {
        if (isYouTube && youtubeVideoId && (onEnded || onPlay || onPause)) {
            // Check if API is already loaded
            if (window.YT && window.YT.Player) {
                setApiReady(true);
                return;
            }

            // Load the YouTube IFrame API script
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

            // Set up callback for when API is ready
            window.onYouTubeIframeAPIReady = () => {
                setApiReady(true);
            };
        }
    }, [isYouTube, youtubeVideoId, onEnded, onPlay, onPause]);

    // Initialize YouTube player when API is ready
    useEffect(() => {
        if (isYouTube && youtubeVideoId && apiReady && window.YT && window.YT.Player) {
            const container = document.getElementById(playerId);
            if (container && !playerRef.current) {
                playerRef.current = new window.YT.Player(playerId, {
                    videoId: youtubeVideoId,
                    playerVars: {
                        enablejsapi: 1,
                        origin: window.location.origin,
                    },
                    events: {
                        onReady: () => {
                            // Player is ready
                        },
                        onStateChange: (event: any) => {
                            if (event.data === window.YT.PlayerState.ENDED && onEnded) {
                                onEnded();
                            } else if (event.data === window.YT.PlayerState.PLAYING && onPlay) {
                                onPlay();
                            } else if (event.data === window.YT.PlayerState.PAUSED && onPause) {
                                onPause();
                            }
                        },
                    },
                });
            }
        }

        // Cleanup
        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isYouTube, youtubeVideoId, apiReady, playerId, onEnded, onPlay, onPause]);

    // Support YouTube videos with IFrame API (when callbacks are needed)
    if (videoUrl && isYouTube && youtubeVideoId && (onEnded || onPlay || onPause)) {
        return (
            <div id={playerId} className={className} />
        );
    }

    // Support YouTube videos with simple iframe (when no callbacks needed)
    if (videoUrl && isYouTube && youtubeVideoId) {
        const embedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?enablejsapi=1&origin=${window.location.origin}`;
        return (
            <iframe
                ref={iframeRef}
                src={embedUrl}
                className={className}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video player"
            />
        );
    }

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
