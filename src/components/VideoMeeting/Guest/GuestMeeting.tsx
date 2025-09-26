import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment } from "react";
import React from "react";

// 🔹 VideoPlayer Component (memoized to avoid re-renders)
const VideoPlayer = ({ track, type }: { track: MediaStreamTrack | null, type?: "screen" | "camera" }) => {
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
            className="w-full h-full object-cover"
        />
    );
};

export const GuestMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
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
        if (!document.fullscreenElement) {
            if (videoContainerRef.current?.requestFullscreen) {
                await videoContainerRef.current.requestFullscreen();
                setIsFullscreen(true);
            }
        } else {
            if (document.exitFullscreen) {
                await document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    // Handle raised hand animations
    useEffect(() => {
        if (raisedHands.size > 0) {
            raisedHands.forEach(participantId => {
                if (!animatedRaisedHands.has(participantId)) {
                    setAnimatedRaisedHands(prev => new Set([...prev, participantId]));

                    // Remove animation after 2 seconds
                    const timeout = setTimeout(() => {
                        setAnimatedRaisedHands(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(participantId);
                            return newSet;
                        });
                    }, 2000);

                    animationTimeouts.current.set(participantId, timeout);
                }
            });
        }
    }, [raisedHands, animatedRaisedHands]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            animationTimeouts.current.forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    if (isPermissionModalOpen) {
        return <PreJoinScreen />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Joining meeting...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-900 text-white flex flex-col">
            {/* Top Control Bar */}
            <MeetingControlsBar
                position="top"
                togglePeoplePanel={() => setShowPeoplePanel((prev) => !prev)}
                toggleChatBox={() => setShowChatBox((prev) => !prev)}
                showChatBox={showChatBox}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                chatUnreadCount={chatUnreadCount}
            />

            {/* Main Video Area */}
            <div className="flex-1 flex relative" ref={videoContainerRef}>
                {!joined ? (
                    <div className="flex items-center justify-center w-full h-full">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                            <p>Connecting to meeting...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">
                        {/* Main video display */}
                        <div className="flex-1 relative bg-black">
                            {isScreensharing && screenshareParticipantId ? (
                                <div className="w-full h-full">
                                    <VideoPlayer
                                        track={participants.find(p => p.id === screenshareParticipantId)?.screenVideoTrack || null}
                                        type="screen"
                                    />
                                </div>
                            ) : localAdminVideoTrack ? (
                                <div className="w-full h-full">
                                    <VideoPlayer track={localAdminVideoTrack} type="camera" />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full h-full bg-gray-800">
                                    <div className="text-center">
                                        <p className="text-lg mb-2">Waiting for presenter...</p>
                                        <p className="text-sm text-gray-400">The webinar will begin shortly</p>
                                    </div>
                                </div>
                            )}

                            {/* Raised hands indicator */}
                            {raisedHands.size > 0 && (
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {Array.from(raisedHands).map(participantId => {
                                        const participant = participants.find(p => p.id === participantId);
                                        if (!participant) return null;

                                        return (
                                            <div
                                                key={participantId}
                                                className={`bg-blue-600 text-white px-3 py-2 rounded-lg shadow-lg transition-all duration-300 ${animatedRaisedHands.has(participantId)
                                                    ? 'animate-bounce scale-110'
                                                    : ''
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold">✋</span>
                                                    <span className="text-sm">{participant.name} raised hand</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Audio elements for other participants */}
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
                    </div>
                )}

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
                togglePeoplePanel={() => setShowPeoplePanel((prev) => !prev)}
                toggleChatBox={() => setShowChatBox((prev) => !prev)}
                showChatBox={showChatBox}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                chatUnreadCount={chatUnreadCount}
            />
        </div>
    );
};
