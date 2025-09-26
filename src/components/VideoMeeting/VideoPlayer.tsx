import React, { useRef, useEffect } from "react";

// 🔹 VideoPlayer Component (memoized to avoid re-renders)
export const VideoPlayer = React.memo(({ track, type, thumbnail }: { track: MediaStreamTrack | null, type?: "screen" | "camera", thumbnail?: boolean }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && track) {
            videoRef.current.srcObject = new MediaStream([track]);
        }
    }, [track]);

    if (!track) return null;

    // Use object-contain for thumbnails to show complete video
    const objectFit = thumbnail ? "object-contain" : (type === "screen" ? "object-contain" : "object-cover");

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full ${objectFit}`}
        />
    );
});