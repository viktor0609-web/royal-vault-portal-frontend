import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { Hand } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment } from "react";
import React from "react";


// 🔹 VideoPlayer Component (memoized to avoid re-renders)
const VideoPlayer = React.memo(({ track, type }: { track: MediaStreamTrack | null, type?: "screen" | "camera" }) => {
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


export const UserMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
        isManager,
        joinRoom,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
        raisedHands,
        localParticipant,
        hasLocalAudioPermission,
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [animatedRaisedHands, setAnimatedRaisedHands] = useState<Set<string>>(new Set());
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
    const hasAttemptedJoin = useRef<boolean>(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Get the local admin's video track
    const localAdminVideoTrack = participants.find(p => p.permissions.canAdmin)?.videoTrack;

    // Auto-join the room when component mounts
    useEffect(() => {
        if (roomUrl && !joined && !isLoading && !hasAttemptedJoin.current) {
            hasAttemptedJoin.current = true;
            joinRoom();
        }
    }, [roomUrl, joined, isLoading, joinRoom]);

    const toggleFullscreen = async () => {
        if (!videoContainerRef.current) return;

        try {
            if (!isFullscreen) {
                if (videoContainerRef.current.requestFullscreen) {
                    await videoContainerRef.current.requestFullscreen();
                } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
                    await (videoContainerRef.current as any).webkitRequestFullscreen();
                } else if ((videoContainerRef.current as any).msRequestFullscreen) {
                    await (videoContainerRef.current as any).msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                } else if ((document as any).msExitFullscreen) {
                    await (document as any).msExitFullscreen();
                }
            }
        } catch (error) {
            console.error("Error toggling fullscreen:", error);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener("fullscreenchange", handleFullscreenChange);
        document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
        document.addEventListener("msfullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
            document.removeEventListener("msfullscreenchange", handleFullscreenChange);
        };
    }, []);

    // Handle raised hand animations
    useEffect(() => {
        const currentRaisedIds = Array.from(raisedHands);
        const currentlyAnimatedIds = Array.from(animatedRaisedHands);

        // Add new raised hands
        currentRaisedIds.forEach(participantId => {
            if (!animatedRaisedHands.has(participantId) && !animationTimeouts.current.has(participantId)) {
                setAnimatedRaisedHands(prev => new Set(prev).add(participantId));
                const timeoutId = setTimeout(() => {
                    setAnimatedRaisedHands(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(participantId);
                        return newSet;
                    });
                    animationTimeouts.current.delete(participantId);
                }, 5000);
                animationTimeouts.current.set(participantId, timeoutId);
            }
        });

        // Remove hands that are no longer raised
        currentlyAnimatedIds.forEach(participantId => {
            if (!raisedHands.has(participantId)) {
                const timeoutId = animationTimeouts.current.get(participantId);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    animationTimeouts.current.delete(participantId);
                }
                setAnimatedRaisedHands(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(participantId);
                    return newSet;
                });
            }
        });

        return () => {
            animationTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
            animationTimeouts.current.clear();
        };
    }, [raisedHands]);


    if (isLoading && !isPermissionModalOpen) {
        return <div className="flex flex-1 items-center justify-center text-xl bg-gray-800 text-white">Loading...</div>;
    }

    if (isPermissionModalOpen) {
        return <PreJoinScreen />;
    }

    const screenshareTrack = isScreensharing
        ? participants.find((p) => p.id === screenshareParticipantId)?.screenVideoTrack
        : null;


    return (
        <div className="flex flex-col h-full w-full min-h-0 max-w-full">
            {/* Main Meeting Area */}
            <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                <div
                    ref={videoContainerRef}
                    id="daily-video-container"
                    className={`flex-1 flex items-center justify-center bg-black min-h-0 max-w-full ${joined ? "" : "p-4"}`}
                >
                    {joined && (
                        <div className="h-full flex flex-col min-h-0 max-w-full">
                            <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0 max-w-full">
                                {/* Main Video Display */}
                                {screenshareTrack && <VideoPlayer track={screenshareTrack} type="screen" />}
                                {!screenshareTrack && localAdminVideoTrack && <VideoPlayer track={localAdminVideoTrack} type="camera" />}
                                {!screenshareTrack && !localAdminVideoTrack && (
                                    <div className="text-white text-xl">No active video.</div>
                                )}

                                {/* Raised hand animation */}
                                {animatedRaisedHands.size > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-3 animate-bounce transition-opacity duration-500 ease-out">
                                        <Hand size={32} className="text-white" />
                                    </div>
                                )}

                                {/* Name label */}
                                {localAdminVideoTrack && (
                                    <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                        Admin
                                    </div>
                                )}
                            </div>

                            {/* Remote participants audio */}
                            {participants.length > 1 && (
                                <>
                                    {participants.filter(p => p.id !== participants[0].id).map((p) => (
                                        <Fragment key={p.id}>
                                            {p.audioTrack && (
                                                <audio
                                                    ref={(audioElement) => {
                                                        if (audioElement && p.audioTrack) {
                                                            audioElement.srcObject = new MediaStream([p.audioTrack]);
                                                        }
                                                    }}
                                                    autoPlay
                                                    playsInline
                                                />
                                            )}
                                        </Fragment>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Sidebars */}
                {joined && showPeoplePanel && <PeoplePanel onClose={() => setShowPeoplePanel(false)} />}
                {joined && showChatBox && (
                    <div className="flex border-l bg-gray-900 text-white">
                        <div className="w-80 p-4 flex flex-col">
                            <ChatBox
                                isVisible={showChatBox}
                                onUnreadCountChange={setChatUnreadCount}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <MeetingControlsBar
                position="bottom"
                togglePeoplePanel={() => setShowPeoplePanel(prev => !prev)}
                toggleChatBox={() => setShowChatBox(prev => !prev)}
                showChatBox={showChatBox}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                localParticipant={localParticipant}
                hasLocalAudioPermission={hasLocalAudioPermission}
                chatUnreadCount={chatUnreadCount}
            />
        </div>
    );
};
