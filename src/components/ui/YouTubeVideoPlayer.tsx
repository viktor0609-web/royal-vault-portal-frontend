import React from 'react';

interface YouTubeVideoPlayerProps {
    youtubeUrl?: string;
    youtubeVideoId?: string;
    className?: string;
    onEnded?: () => void;
    onPlay?: () => void;
    onPause?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

// Utility function to extract YouTube video ID from URL
const extractYouTubeVideoId = (url: string): string | null => {
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

export function YouTubeVideoPlayer({
    youtubeUrl,
    youtubeVideoId,
    className = "w-full h-full",
    onEnded,
    onPlay,
    onPause,
    onTimeUpdate
}: YouTubeVideoPlayerProps) {
    // Get the video ID from either prop or URL
    const videoId = youtubeVideoId || (youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null);

    // Debug logging
    console.log('🎥 YouTubeVideoPlayer props:', {
        youtubeUrl,
        youtubeVideoId,
        extractedVideoId: youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : null,
        finalVideoId: videoId
    });

    if (!videoId) {
        console.log('⚠️ No video ID available, showing fallback');
        return (
            <div className={`${className} flex items-center justify-center bg-gray-100 rounded-lg`}>
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📹</div>
                    <p>No YouTube video available</p>
                    <p className="text-sm mt-2 text-gray-400">
                        {youtubeUrl ? 'Invalid YouTube URL' : 'No video URL provided'}
                    </p>
                </div>
            </div>
        );
    }

    // Build the YouTube embed URL
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1&showinfo=0&fs=1&cc_load_policy=0&iv_load_policy=3&autohide=0&playsinline=1`;

    console.log('🎬 Creating YouTube embed with URL:', embedUrl);

    return (
        <div className={className}>
            <iframe
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full rounded-lg"
                onLoad={() => console.log('✅ YouTube iframe loaded')}
                onError={() => console.error('❌ YouTube iframe failed to load')}
            />
            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === 'development' && (
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded">
                    <div>Video ID: {videoId}</div>
                    <div>URL: {youtubeUrl || 'N/A'}</div>
                </div>
            )}
        </div>
    );
}
