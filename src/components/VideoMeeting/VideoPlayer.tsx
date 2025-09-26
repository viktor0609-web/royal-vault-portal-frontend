import React, { useRef, useEffect } from "react";

// 🔹 VideoPlayer Component (memoized to avoid re-renders)
export const VideoPlayer = React.memo(({ track, type }: { track: MediaStreamTrack | null, type?: "screen" | "camera" }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && track) {
            videoRef.current.srcObject = new MediaStream([track]);
        }
    }, [track]);

    if (!track) return null;

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            className={type === "screen" ? "w-full h-full object-contain" : "w-full h-full object-cover"}
        />
    );
});