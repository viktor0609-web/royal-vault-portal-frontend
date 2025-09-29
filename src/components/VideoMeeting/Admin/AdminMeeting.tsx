import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { Mic, MicOff } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { VideoPlayer } from "../VideoPlayer";
import { useState, useEffect, useRef, Fragment, useMemo } from "react";

export const AdminMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
        role,
        setRole,
        joinRoom,
        ejectParticipant,
        toggleParticipantAudio,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const hasAttemptedJoin = useRef<boolean>(false);

    const videoContainerRef = useRef<HTMLDivElement>(null);
    // Audio refs
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    // Get video tracks
    const guestVideoTrack = participants.find(p => p.name.includes("Guest"))?.videoTrack;
    const localAdminVideoTrack = participants.find((p) => p.local)?.videoTrack;
    const screenshareTrack = isScreensharing
        ? participants.find((p) => p.id === screenshareParticipantId)
            ?.screenVideoTrack
        : null;

    // Main video: prioritize guest video, then local admin's video
    const mainVideoTrack = guestVideoTrack || localAdminVideoTrack;

    useEffect(() => {
        setRole("Admin");
    }, []);

    // Auto-join the room when component mounts
    useEffect(() => {
        if (roomUrl && !joined && !isLoading && !hasAttemptedJoin.current) {
            hasAttemptedJoin.current = true;
            joinRoom();
        }
    }, [roomUrl, joined, isLoading, joinRoom]);


    // Attach main participant audio
    useEffect(() => {
        if (mainAudioRef.current && participants[0]?.audioTrack) {
            mainAudioRef.current.srcObject = new MediaStream([
                participants[0].audioTrack,
            ]);
        }
    }, [participants]);

    // Attach remote audios
    useEffect(() => {
        participants.forEach((p) => {
            if (p.audioTrack && remoteAudioRefs.current[p.id]) {
                remoteAudioRefs.current[p.id]!.srcObject = new MediaStream([
                    p.audioTrack,
                ]);
            }
        });
    }, [participants]);



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

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('msfullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('msfullscreenchange', handleFullscreenChange);
        };
    }, []);

    if (isLoading && !isPermissionModalOpen) {
        return (
            <div className="flex flex-1 items-center justify-center text-xl bg-gray-800 text-white">
                Loading...
            </div>
        );
    }

    if (isPermissionModalOpen) {
        return <PreJoinScreen />;
    }


    return (
        <div className="flex flex-col h-full w-full min-h-0 max-w-full">
            <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                <div
                    ref={videoContainerRef}
                    id="daily-video-container"
                    className={`flex-1 flex items-center justify-center bg-black min-h-0 max-w-full ${joined ? "" : "p-4"
                        }`}
                >
                    {joined && (
                        <div className="h-full flex flex-col min-h-0 max-w-full">
                            <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0 max-w-full">
                                {/* Screenshare first */}
                                {screenshareTrack && (
                                    <VideoPlayer track={screenshareTrack} type="screen" />
                                )}

                                {/* Main video when no screenshare */}
                                {!screenshareTrack && mainVideoTrack && (
                                    <>
                                        <VideoPlayer track={mainVideoTrack} type="camera" />
                                        {/* Name label for main video */}
                                        <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                                            {guestVideoTrack
                                                ? `${participants.find(p => p.name.includes("Guest"))?.name}`
                                                : `${participants.find(p => p.local)?.name}`
                                            }
                                        </div>
                                    </>
                                )}

                                {/* Fallback */}
                                {!screenshareTrack && !mainVideoTrack && (
                                    <div className="text-white text-xl">No active video.</div>
                                )}


                                {/* Main participant audio */}
                                {participants[0]?.audioTrack && (
                                    <audio
                                        ref={mainAudioRef}
                                        autoPlay
                                        playsInline
                                        muted={participants[0].local}
                                    />
                                )}


                            </div>

                            {/* Remote participants audio */}
                            {participants.length > 1 &&
                                participants
                                    .filter((p) => p.id !== participants[0].id)
                                    .map((p) => (
                                        <Fragment key={p.id}>
                                            {p.audioTrack && (
                                                <audio
                                                    ref={(el) => (remoteAudioRefs.current[p.id] = el)}
                                                    autoPlay
                                                    playsInline
                                                />
                                            )}
                                        </Fragment>
                                    ))}
                        </div>
                    )}

                </div>

                {joined && showPeoplePanel && (
                    <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                )}

                {joined && showChatBox && (
                    <div className="flex border-l bg-gray-900 text-white">
                        <div className="w-80 p-4 flex flex-col">
                            <ChatBox
                                isVisible={showChatBox}
                                onUnreadCountChange={setChatUnreadCount}
                                isAdmin={true}
                            />
                        </div>
                    </div>
                )}
            </div>

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
