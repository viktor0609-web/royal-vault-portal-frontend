import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { FloatingControls } from "../FloatingControls";
import { BottomSheet } from "../BottomSheet";
import { PeoplePanel } from "./PeoplePanel";
import { VideoPlayer } from "../VideoPlayer";
import { useState, useEffect, useRef, Fragment } from "react";


interface UserMeetingProps {
    webinarId?: string;
    webinarStatus: string;
}

export const UserMeeting: React.FC<UserMeetingProps> = ({ webinarId, webinarStatus }) => {
    const {
        roomUrl,
        joined,
        participants,
        role,
        joinRoom,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
        localParticipant,
        hasLocalAudioPermission,
        startScreenshare,
        stopScreenshare,
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const hasAttemptedJoin = useRef<boolean>(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // On desktop, chat should always be visible
    useEffect(() => {
        if (joined) {
            // Check if we're on desktop (sm breakpoint and above)
            const checkDesktop = () => {
                if (window.innerWidth >= 640) { // sm breakpoint
                    setShowChatBox(true);
                }
            };
            // Initial check
            checkDesktop();
            // Listen for resize events
            window.addEventListener('resize', checkDesktop);
            return () => window.removeEventListener('resize', checkDesktop);
        }
    }, [joined]);

    // Get video tracks
    const localUserVideoTrack = participants.find(p => p.local)?.videoTrack;

    // Find active guest (prioritize: speaking/unmuted, then video on, then first guest)
    const activeGuest = participants
        .filter(p => p.name.includes("Guest") && !p.permissions?.canAdmin)
        .sort((a, b) => {
            // Prioritize guests with audio on (speaking)
            if (a.audio && !b.audio) return -1;
            if (!a.audio && b.audio) return 1;
            // Then prioritize guests with video on
            if (a.video && !b.video) return -1;
            if (!a.video && b.video) return 1;
            return 0;
        })[0];
    
    const guestVideoTrack = activeGuest?.videoTrack;
    const mainVideoTrack = guestVideoTrack || localUserVideoTrack;

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
        <>
            {(webinarStatus === "Waiting" || webinarStatus === "Scheduled") && (
                <div className="flex flex-1 items-center justify-center bg-gray-800 text-white rounded-lg">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Webinar Is Not Started Yet</h2>
                        <p className="text-gray-400">The webinar will start in just a few minutes. Please stay here. </p>
                    </div>
                </div>
            )}
            {/* Webinar Ended Message */}
            {webinarStatus === 'Ended' && (
                <div className="flex flex-1 items-center justify-center bg-gray-800 text-white rounded-lg">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Webinar Has Ended</h2>
                        <p className="text-gray-400">This webinar has been closed by the admin.</p>
                    </div>
                </div>
            )}
            {webinarStatus === "In Progress" && (
                <div className="flex flex-col h-full w-full min-h-0 max-w-full @container/meeting">
                    {/* Main Meeting Area - Responsive video container */}
                    <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                        <div
                            ref={videoContainerRef}
                            id="daily-video-container"
                            className={`flex-1 flex items-center justify-center bg-black min-h-0 max-w-full ${joined ? "" : "p-2 sm:p-4"}`}
                        >
                            {joined && (
                                <div className="h-full flex flex-col min-h-0 max-w-full">
                                    <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0 max-w-full">
                                        {/* Screenshare first */}
                                        {screenshareTrack && <VideoPlayer track={screenshareTrack} type="screen" />}

                                        {/* Main video when no screenshare - show active Guest video */}
                                        {!screenshareTrack && (
                                            <>
                                                <VideoPlayer
                                                    track={activeGuest && activeGuest.video ? guestVideoTrack : null}
                                                    type="camera"
                                                    participantName={activeGuest?.name || "Guest"}
                                                    showAvatarWhenOff={true}
                                                />
                                                {/* Name label for main video */}
                                                <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                                                    {activeGuest?.name || "Guest"}
                                                </div>
                                            </>
                                        )}

                                    </div>

                                    {/* Remote participants audio */}
                                    {participants.length > 1 && (
                                        <>
                                            {participants.filter(p => p.id !== localParticipant?.id).map((p) => (
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

                        {/* People Panel - BottomSheet on mobile, sidebar on desktop */}
                        {joined && showPeoplePanel && (
                            <>
                                {/* Desktop: Sidebar */}
                                <div className="hidden md:block relative">
                                    <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                                </div>
                                {/* Mobile: BottomSheet */}
                                <BottomSheet
                                    isOpen={showPeoplePanel}
                                    onClose={() => setShowPeoplePanel(false)}
                                    title="Participants"
                                    maxHeight="80vh"
                                >
                                    <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                                </BottomSheet>
                            </>
                        )}

                        {/* Chat panel - BottomSheet on mobile, sidebar on desktop */}
                        {joined && showChatBox && (
                            <>
                                {/* Desktop: Sidebar */}
                                <div className="hidden md:flex border-l bg-gray-900 text-white">
                                    <div className="w-80 lg:w-96 p-4 flex flex-col overflow-visible">
                                        <ChatBox
                                            isVisible={showChatBox}
                                            onUnreadCountChange={setChatUnreadCount}
                                            webinarId={webinarId}
                                        />
                                    </div>
                                </div>
                                {/* Mobile: BottomSheet */}
                                <BottomSheet
                                    isOpen={showChatBox}
                                    onClose={() => setShowChatBox(false)}
                                    title="Chat"
                                    maxHeight="80vh"
                                >
                                    <div className="h-full flex flex-col min-h-0 p-4" style={{ height: 'calc(80vh - 100px)' }}>
                                        <ChatBox
                                            isVisible={showChatBox}
                                            onUnreadCountChange={setChatUnreadCount}
                                            webinarId={webinarId}
                                        />
                                    </div>
                                </BottomSheet>
                            </>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <MeetingControlsBar
                        position="bottom"
                        togglePeoplePanel={() => {
                            setShowPeoplePanel(prev => !prev);
                            // Don't close chat on desktop - only on mobile
                            if (window.innerWidth < 640 && showChatBox) {
                                setShowChatBox(false);
                            }
                        }}
                        toggleChatBox={() => {
                            // Only allow toggle on mobile
                            if (window.innerWidth < 640) {
                                setShowChatBox(prev => !prev);
                                if (showPeoplePanel) setShowPeoplePanel(false);
                            }
                        }}
                        showChatBox={showChatBox}
                        toggleFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        localParticipant={localParticipant}
                        chatUnreadCount={chatUnreadCount}
                    />

                    {/* Mobile Floating Controls - Hide when panels are open */}
                    {(!showPeoplePanel && !showChatBox) && (
                        <FloatingControls
                            togglePeoplePanel={() => {
                                setShowPeoplePanel(prev => !prev);
                                if (window.innerWidth < 640 && showChatBox) {
                                    setShowChatBox(false);
                                }
                            }}
                            toggleChatBox={() => {
                                if (window.innerWidth < 640) {
                                    setShowChatBox(prev => !prev);
                                    if (showPeoplePanel) setShowPeoplePanel(false);
                                }
                            }}
                            showChatBox={showChatBox}
                            toggleFullscreen={toggleFullscreen}
                            isFullscreen={isFullscreen}
                            chatUnreadCount={chatUnreadCount}
                            role={role}
                            isScreensharing={isScreensharing}
                            startScreenshare={startScreenshare}
                            stopScreenshare={stopScreenshare}
                        />
                    )}
                </div>)}
        </>
    );
};
