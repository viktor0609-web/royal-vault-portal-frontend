import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { FloatingControls } from "../FloatingControls";
import { BottomSheet } from "../BottomSheet";
import { PeoplePanel } from "./PeoplePanel";
import { SettingsContent } from "../SettingsModal";
import { LeftSidePanel } from "../LeftSidePanel";
import { useState, useEffect, useRef, Fragment } from "react";
import { VideoPlayer } from "../VideoPlayer";
import type { Webinar } from "@/types";

interface GuestMeetingProps {
    webinarId?: string;
    webinarStatus: string;
    webinar?: Webinar | null;
}

export const GuestMeeting: React.FC<GuestMeetingProps> = ({ webinarId, webinarStatus, webinar }) => {
    const {
        roomUrl,
        joined,
        participants,
        setRole,
        joinRoom,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
        localParticipant,
        hasLocalAudioPermission,
        role,
        startScreenshare,
        stopScreenshare,
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [showLeftPanel, setShowLeftPanel] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const hasAttemptedJoin = useRef<boolean>(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // On desktop, chat and left panel should always be visible
    useEffect(() => {
        if (joined) {
            // Check if we're on desktop (sm breakpoint and above)
            const checkDesktop = () => {
                if (window.innerWidth >= 640) { // sm breakpoint
                    setShowChatBox(true);
                    setShowLeftPanel(true);
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
        setRole("Guest");
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
            {webinarStatus === 'Ended' && (
                <div className="flex flex-1 items-center justify-center bg-gray-800 text-white rounded-lg">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Webinar Has Ended</h2>
                        <p className="text-gray-400">This webinar has been closed by the admin.</p>
                    </div>
                </div>
            )}
            {webinarStatus !== 'Ended' && (
                <div className="flex flex-col h-full w-full min-h-0 max-w-full">
                    {/* Main Meeting Area */}
                    <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                        {/* Left Side Panel - CTA Buttons and Pinned Messages - Always visible on desktop */}
                        {joined && (
                            <>
                                {/* Desktop: Sidebar - Always visible on left */}
                                <div className="hidden md:flex border-r bg-white">
                                    <div className="w-80 p-0 flex flex-col overflow-hidden">
                                        <LeftSidePanel webinar={webinar} />
                                    </div>
                                </div>
                                {/* Mobile: BottomSheet - Only show if explicitly opened */}
                                {showLeftPanel && (
                                    <BottomSheet
                                        isOpen={showLeftPanel}
                                        onClose={() => setShowLeftPanel(false)}
                                        title="CTA & Pinned Messages"
                                        maxHeight="80vh"
                                    >
                                        <div className="h-full flex flex-col min-h-0" style={{ height: 'calc(80vh - 100px)' }}>
                                            <LeftSidePanel webinar={webinar} />
                                        </div>
                                    </BottomSheet>
                                )}
                            </>
                        )}

                        {/* Main Video Container */}
                        <div
                            ref={videoContainerRef}
                            id="daily-video-container"
                            className={`flex-1 flex items-center justify-center bg-black min-h-0 max-w-full ${joined ? "" : "p-4"}`}
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
                                    <div className="h-full flex flex-col min-h-0" style={{ height: 'calc(80vh - 100px)' }}>
                                        <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                                    </div>
                                </BottomSheet>
                            </>
                        )}

                        {/* Chat panel - Always visible on desktop, on the right */}
                        {joined && (
                            <>
                                {/* Desktop: Sidebar - Always visible on right */}
                                <div className="hidden md:flex border-l bg-gray-900 text-white">
                                    <div className="w-64 p-0 flex flex-col overflow-visible">
                                        <ChatBox
                                            isVisible={true}
                                            onUnreadCountChange={setChatUnreadCount}
                                            webinarId={webinarId}
                                        />
                                    </div>
                                </div>
                                {/* Mobile: BottomSheet - Only show if explicitly opened */}
                                {showChatBox && (
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
                                )}
                            </>
                        )}

                    </div>

                    {/* Bottom Control Bar */}
                    <MeetingControlsBar
                        position="bottom"
                        togglePeoplePanel={() => {
                            setShowPeoplePanel(prev => !prev);
                        }}
                        toggleFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        localParticipant={localParticipant}
                        chatUnreadCount={chatUnreadCount}
                    />

                    {/* Mobile Floating Controls - Hide when panels are open */}
                    {(!showPeoplePanel && !showSettings) && (
                        <FloatingControls
                            togglePeoplePanel={() => {
                                setShowPeoplePanel(prev => !prev);
                            }}
                            toggleSettings={() => {
                                setShowSettings((prev) => !prev);
                                if (window.innerWidth < 640) {
                                    if (showPeoplePanel) setShowPeoplePanel(false);
                                }
                            }}
                            toggleFullscreen={toggleFullscreen}
                            isFullscreen={isFullscreen}
                            chatUnreadCount={chatUnreadCount}
                            role={role}
                            isScreensharing={isScreensharing}
                            startScreenshare={startScreenshare}
                            stopScreenshare={stopScreenshare}
                        />
                    )}

                    {/* Settings panel - BottomSheet on mobile, Dialog on desktop */}
                    {joined && showSettings && (
                        <>
                            {/* Desktop: Dialog (handled by SettingsModal) */}
                            {/* Mobile: BottomSheet */}
                            <BottomSheet
                                isOpen={showSettings}
                                onClose={() => setShowSettings(false)}
                                title="Settings"
                                maxHeight="80vh"
                            >
                                <div className="p-4">
                                    <SettingsContent />
                                </div>
                            </BottomSheet>
                        </>
                    )}
                </div>
            )}
        </>

    );
};
