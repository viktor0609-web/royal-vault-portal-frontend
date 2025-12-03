import { Button } from "../../ui/button";
import { Loading } from "../../ui/Loading";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox, ChatBoxRef } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { FloatingControls } from "../FloatingControls";
import { BottomSheet } from "../BottomSheet";
import { SettingsContent } from "../SettingsModal";
import { Mic, MicOff, X, Loader2 } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { VideoPlayer } from "../VideoPlayer";
import { LeftSidePanel } from "../LeftSidePanel";
import { useState, useEffect, useRef, Fragment, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "../../../hooks/use-toast";
import { webinarApi } from "../../../lib/api";
import type { Webinar } from "@/types";

interface AdminMeetingProps {
    webinarId?: string;
    webinar?: Webinar | null;
}

export const AdminMeeting: React.FC<AdminMeetingProps> = ({ webinarId, webinar }) => {
    const {
        roomUrl,
        joined,
        participants,
        role,
        setRole,
        joinRoom,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
        isRecording,
        localParticipant,
        startRecording,
        stopRecording,
        startScreenshare,
        stopScreenshare,
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [showLeftPanel, setShowLeftPanel] = useState<boolean>(false);
    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [pinnedMessagesRefresh, setPinnedMessagesRefresh] = useState<number>(0);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const chatBoxRef = useRef<ChatBoxRef>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const { toast } = useToast();
    const { slug } = useParams<{ slug: string }>();

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
    const [showProcessingNotification, setShowProcessingNotification] = useState<boolean>(false);
    const hasAttemptedJoin = useRef<boolean>(false);
    const prevRecordingRef = useRef<boolean>(false);
    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const videoContainerRef = useRef<HTMLDivElement>(null);
    // Audio refs
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    // Get video tracks
    const localAdminVideoTrack = participants.find((p) => p.local)?.videoTrack;
    const screenshareTrack = isScreensharing
        ? participants.find((p) => p.id === screenshareParticipantId)
            ?.screenVideoTrack
        : null;

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

    // Handle countdown timer
    useEffect(() => {
        if (countdown === null) return;

        if (countdown === 0) {
            // Countdown finished, start recording
            const startActualRecording = async () => {
                try {
                    const response = await webinarApi.setWebinarOnRecording(slug as string);
                    if (response.status !== 200) {
                        throw new Error('Failed to set webinar on recording');
                    }
                    startRecording();
                    setCountdown(null);
                } catch (error) {
                    console.error('Error starting recording:', error);
                    toast({
                        title: "Error",
                        description: "Failed to start recording. Please try again.",
                        variant: "destructive",
                    });
                    setCountdown(null);
                }
            };
            startActualRecording();
            return;
        }

        // Decrease countdown every second
        const timer = setTimeout(() => {
            setCountdown(countdown - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, slug, startRecording, toast]);

    // Handle ESC key to cancel countdown
    useEffect(() => {
        if (countdown === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setCountdown(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [countdown]);

    const handleStartRecording = () => {
        console.log("Start Recording Clicked");
        // Start countdown from 3
        setCountdown(3);
    };

    // Track recording state and show notification for 10 seconds after stopping
    useEffect(() => {
        // Check if recording just stopped (was true, now false)
        if (prevRecordingRef.current && !isRecording) {
            // Clear any existing timeout
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }

            // Show notification immediately
            setShowProcessingNotification(true);

            // Hide notification after 10 seconds
            processingTimeoutRef.current = setTimeout(() => {
                setShowProcessingNotification(false);
            }, 10000); // 10 seconds
        }

        // Reset notification if recording starts again
        if (isRecording) {
            setShowProcessingNotification(false);
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        }

        // Update previous recording state
        prevRecordingRef.current = isRecording;

        // Cleanup on unmount
        return () => {
            if (processingTimeoutRef.current) {
                clearTimeout(processingTimeoutRef.current);
            }
        };
    }, [isRecording]);

    if (isLoading && !isPermissionModalOpen) {
        return (
            <div className="flex flex-1 items-center justify-center bg-gray-800">
                <Loading message="Loading meeting..." className="text-white" />
            </div>
        );
    }

    if (isPermissionModalOpen) {
        return <PreJoinScreen />;
    }


    return (
        <div className="flex flex-col h-full w-full min-h-0 max-w-full relative">
            {/* Countdown Overlay */}
            {countdown !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <div className="text-center">
                        <div className="text-9xl sm:text-[12rem] font-bold text-white animate-pulse">
                            {countdown}
                        </div>
                        <p className="text-2xl sm:text-3xl text-white mt-4 font-semibold">
                            Recording will start...
                        </p>
                        <p className="text-sm sm:text-base text-white/70 mt-2">
                            Press ESC to cancel
                        </p>
                    </div>
                </div>
            )}

            {/* Recording Processing Notification */}
            {showProcessingNotification && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3 bg-blue-600 text-white px-4 py-2.5 rounded-lg shadow-lg border border-blue-500/50">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Processing recording...</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowProcessingNotification(false)}
                            className="h-5 w-5 p-0 hover:bg-blue-700 text-white ml-1"
                        >
                            <X className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                {/* Left Side Panel - CTA Buttons and Pinned Messages - Always visible on desktop */}
                {joined && (
                    <>
                        {/* Desktop: Sidebar - Always visible on left */}
                        <div className="hidden md:flex border-r border-gray-200 bg-white">
                            <div className="w-80 p-0 flex flex-col overflow-hidden">
                                <LeftSidePanel
                                    webinar={webinar}
                                    webinarId={webinarId}
                                    refreshTrigger={pinnedMessagesRefresh}
                                    onPinChange={() => setPinnedMessagesRefresh(prev => prev + 1)}
                                    onUnpinMessage={(messageId) => chatBoxRef.current?.updateMessagePinStatus(messageId, false)}
                                />
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
                                    <LeftSidePanel
                                        webinar={webinar}
                                        webinarId={webinarId}
                                        refreshTrigger={pinnedMessagesRefresh}
                                        onPinChange={() => setPinnedMessagesRefresh(prev => prev + 1)}
                                        onUnpinMessage={(messageId) => chatBoxRef.current?.updateMessagePinStatus(messageId, false)}
                                    />
                                </div>
                            </BottomSheet>
                        )}
                    </>
                )}

                {/* Main Video Container */}
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
                        <div className="hidden md:flex border-l border-gray-200 bg-white">
                            <div className="w-80 p-0 flex flex-col overflow-visible">
                                <ChatBox
                                    ref={chatBoxRef}
                                    isVisible={true}
                                    onUnreadCountChange={setChatUnreadCount}
                                    isAdmin={true}
                                    webinarId={webinarId}
                                    webinar={webinar}
                                    onPinChange={() => setPinnedMessagesRefresh(prev => prev + 1)}
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
                                        isAdmin={true}
                                        webinarId={webinarId}
                                        webinar={webinar}
                                    />
                                </div>
                            </BottomSheet>
                        )}
                    </>
                )}


            </div>

            <MeetingControlsBar
                position="bottom"
                togglePeoplePanel={() => {
                    setShowPeoplePanel((prev) => !prev);
                }}
                toggleFullscreen={toggleFullscreen}
                isFullscreen={isFullscreen}
                chatUnreadCount={chatUnreadCount}
                countdown={countdown}
                setCountdown={setCountdown}
                handleStartRecording={handleStartRecording}
            />

            {/* Mobile Floating Controls - Hide when panels are open */}
            {(!showPeoplePanel && !showSettings) && (
                <FloatingControls
                    togglePeoplePanel={() => {
                        setShowPeoplePanel((prev) => !prev);
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
                    isRecording={isRecording}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    isScreensharing={isScreensharing}
                    startScreenshare={startScreenshare}
                    stopScreenshare={stopScreenshare}
                    onStartRecordingClick={handleStartRecording}
                    countdown={countdown}
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
    );
};
