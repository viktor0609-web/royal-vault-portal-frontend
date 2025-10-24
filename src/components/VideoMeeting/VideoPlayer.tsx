import React, { useRef, useEffect } from "react";
import { CameraOffAvatar } from "./CameraOffAvatar";

interface VideoPlayerProps {
    track: MediaStreamTrack | null;
    type?: "screen" | "camera";
    thumbnail?: boolean;
    participantName?: string;
    showAvatarWhenOff?: boolean;
}

// 🔹 VideoPlayer Component (memoized to avoid re-renders)
export const VideoPlayer = React.memo(({
    track,
    type,
    thumbnail,
    participantName,
    showAvatarWhenOff = false
}: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && track) {
            videoRef.current.srcObject = new MediaStream([track]);
        }
    }, [track]);

    // If no track and we should show avatar, display the avatar
    if (!track && showAvatarWhenOff && participantName) {
        const avatarSize = thumbnail ? 'sm' : 'xl';
        return (
            <div className="w-full h-full flex items-center justify-center">
                <CameraOffAvatar
                    name={participantName}
                    size={avatarSize}
                />
            </div>
        );
    }

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