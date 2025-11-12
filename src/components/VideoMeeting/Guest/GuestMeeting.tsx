import { Button } from "../../ui/button";
import { X } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment } from "react";
import { VideoPlayer } from "../VideoPlayer";

interface GuestMeetingProps {
    webinarId?: string;
    webinarStatus: string;
}

export const GuestMeeting: React.FC<GuestMeetingProps> = ({ webinarId, webinarStatus }) => {
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
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [showChatBox, setShowChatBox] = useState<boolean>(false);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [chatUnreadCount, setChatUnreadCount] = useState<number>(0);
    const hasAttemptedJoin = useRef<boolean>(false);
    const videoContainerRef = useRef<HTMLDivElement>(null);

    // Get video tracks
    const localUserVideoTrack = participants.find(p => p.local)?.videoTrack;

    // Main video: prioritize guest video, then local user's video
    const mainVideoTrack = localUserVideoTrack;

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

                                        {/* Main video when no screenshare */}
                                        {!screenshareTrack && (
                                            <>
                                                <VideoPlayer
                                                    track={participants.find(p => p.local)?.video ? mainVideoTrack : null}
                                                    type="camera"
                                                    participantName={participants.find(p => p.local)?.name || "Guest"}
                                                    showAvatarWhenOff={true}
                                                />
                                                {/* Name label for main video */}
                                                <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                                                    You: {participants.find(p => p.local)?.name}
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

                        {/* Right Sidebars */}
                        {joined && showPeoplePanel && (
                            <div className="fixed inset-0 z-50 sm:relative sm:inset-auto">
                                <div className="w-full h-full sm:w-auto h-auto">
                                    <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                                </div>
                            </div>
                        )}
                        {joined && showChatBox && (
                            <div className="fixed inset-0 z-50 sm:relative sm:inset-auto flex border-l bg-gray-900 text-white">
                                <div className="w-full sm:w-80 lg:w-96 p-4 flex flex-col">
                                    {/* Mobile close button */}
                                    <div className="flex justify-end mb-2 sm:hidden">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowChatBox(false)}
                                            className="h-8 w-8 text-white hover:bg-gray-700"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <ChatBox
                                        isVisible={showChatBox}
                                        onUnreadCountChange={setChatUnreadCount}
                                        webinarId={webinarId}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Control Bar */}
                    <MeetingControlsBar
                        position="bottom"
                        togglePeoplePanel={() => {
                            setShowPeoplePanel(prev => !prev);
                            if (showChatBox) setShowChatBox(false);
                        }}
                        toggleChatBox={() => {
                            setShowChatBox(prev => !prev);
                            if (showPeoplePanel) setShowPeoplePanel(false);
                        }}
                        showChatBox={showChatBox}
                        toggleFullscreen={toggleFullscreen}
                        isFullscreen={isFullscreen}
                        localParticipant={localParticipant}
                        chatUnreadCount={chatUnreadCount}
                    />
                </div>
            )}
        </>

    );
};
