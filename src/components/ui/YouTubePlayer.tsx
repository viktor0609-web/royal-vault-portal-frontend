import React, { useEffect, useRef } from 'react';

interface YouTubePlayerProps {
    videoId: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayer({
    videoId,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: YouTubePlayerProps) {
    const playerRef = useRef<HTMLDivElement>(null);
    const playerInstanceRef = useRef<any>(null);

    useEffect(() => {
        // Load YouTube API if not already loaded
        if (!window.YT) {
            const script = document.createElement('script');
            script.src = 'https://www.youtube.com/iframe_api';
            script.async = true;
            document.head.appendChild(script);

            window.onYouTubeIframeAPIReady = () => {
                initializePlayer();
            };
        } else {
            initializePlayer();
        }

        return () => {
            if (playerInstanceRef.current) {
                playerInstanceRef.current.destroy();
            }
        };
    }, [videoId]);

    const initializePlayer = () => {
        if (!playerRef.current || !window.YT) return;

        playerInstanceRef.current = new window.YT.Player(playerRef.current, {
            videoId: videoId,
            width: '100%',
            height: '100%',
            playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                fs: 1,
                cc_load_policy: 0,
                iv_load_policy: 3,
                autohide: 0,
                playsinline: 1,
                enablejsapi: 1,
                origin: window.location.origin
            },
            events: {
                onReady: (event: any) => {
                    console.log('YouTube player ready');
                },
                onStateChange: (event: any) => {
                    const state = event.data;

                    if (state === window.YT.PlayerState.PLAYING) {
                        onPlay?.();
                    } else if (state === window.YT.PlayerState.PAUSED) {
                        onPause?.();
                    } else if (state === window.YT.PlayerState.ENDED) {
                        onEnded?.();
                    }
                },
                onError: (event: any) => {
                    console.error('YouTube player error:', event.data);
                }
            }
        });
    };

    // Expose player methods
    useEffect(() => {
        if (playerInstanceRef.current) {
            // Add time update listener
            const interval = setInterval(() => {
                if (playerInstanceRef.current && playerInstanceRef.current.getCurrentTime) {
                    const currentTime = playerInstanceRef.current.getCurrentTime();
                    onTimeUpdate?.(currentTime);
                }
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [onTimeUpdate]);

    return (
        <div className={className}>
            <div ref={playerRef} className="w-full h-full" />
        </div>
    );
}

// Utility function to extract YouTube video ID from URL
export const extractYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }

    return null;
};

// Utility function to detect video type from URL
export const detectVideoType = (url: string): 'youtube' | 'vimeo' | 'uploaded' | 'external' => {
    if (!url) return 'uploaded';

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        return 'youtube';
    } else if (url.includes('vimeo.com')) {
        return 'vimeo';
    } else if (url.startsWith('http')) {
        return 'external';
    }

    return 'uploaded';
};
