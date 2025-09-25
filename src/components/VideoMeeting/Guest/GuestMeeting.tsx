import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { Mic, MicOff, Hand, ArrowLeft } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment } from 'react';
import { useAuth } from "../../../context/AuthContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import { webinarApi } from "../../../lib/api";
import { useToast } from "../../../hooks/use-toast";

export const GuestMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
        isManager,
        setRoomUrl,
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
    const [animatedRaisedHands, setAnimatedRaisedHands] = useState<Set<string>>(new Set());
    const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Access control
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [accessChecking, setAccessChecking] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [webinar, setWebinar] = useState<any>(null);

    // Set user name for the meeting
    const { setUserName } = useDailyMeeting();

    const webinarId = searchParams.get('webinarId');
    const webinarName = searchParams.get('name');

    // Set user name when component mounts
    useEffect(() => {
        if (user && user.name) {
            setUserName(user.name);
        }
    }, [user, setUserName]);

    // Check access control and set room URL
    useEffect(() => {
        const checkAccess = async () => {
            if (!user || !webinarId) {
                setAccessChecking(false);
                setHasAccess(false);
                return;
            }

            try {
                // Fetch webinar details
                const response = await webinarApi.getPublicWebinarById(webinarId);
                const webinarData = response.data.webinar;
                setWebinar(webinarData);

                // Check if user is registered for this webinar
                const isRegistered = webinarData.attendees?.some((attendee: any) =>
                    attendee.user.toString() === user._id.toString()
                );

                if (isRegistered) {
                    setHasAccess(true);
                    // Use the pre-configured Daily.co room URL from environment
                    const dailyRoomUrl = import.meta.env.VITE_DAILY_ROOM_URL;
                    console.log('Environment variable VITE_DAILY_ROOM_URL:', dailyRoomUrl);
                    console.log('Type of dailyRoomUrl:', typeof dailyRoomUrl);
                    console.log('Boolean check:', !!dailyRoomUrl);
                    console.log('Length:', dailyRoomUrl?.length);
                    if (dailyRoomUrl) {
                        console.log('Setting room URL:', dailyRoomUrl);
                        setRoomUrl(dailyRoomUrl);
                        // Auto-join the room after a short delay, but only if not already joined
                        if (!joined) {
                            setTimeout(() => {
                                console.log('Attempting to join room with URL:', dailyRoomUrl);
                                joinRoom();
                            }, 1000);
                        }
                    } else {
                        console.error('VITE_DAILY_ROOM_URL environment variable is not set');
                        toast({
                            title: "Configuration Error",
                            description: "Daily.co room URL is not configured",
                            variant: "destructive",
                        });
                    }
                } else {
                    setHasAccess(false);
                    toast({
                        title: "Access Denied",
                        description: "You must be registered for this webinar to access the live session",
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error('Error checking access:', error);
                setHasAccess(false);
                toast({
                    title: "Error",
                    description: "Failed to verify webinar access",
                    variant: "destructive",
                });
            } finally {
                setAccessChecking(false);
            }
        };

        checkAccess();
    }, [user, webinarId, toast]);

    // Get the local admin's video track
    const localAdminVideoTrack = participants.find(p => p.permissions.canAdmin)?.videoTrack;
    participants.forEach(p => {
        console.log(p);
    })

    useEffect(() => {
        const currentRaisedIds = Array.from(raisedHands);
        const currentlyAnimatedIds = Array.from(animatedRaisedHands);

        // Add new raised hands to animated set
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
                }, 5000); // Animation visible for 5 seconds
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

        // Cleanup on unmount
        return () => {
            animationTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
            animationTimeouts.current.clear();
        };
    }, [raisedHands]);

    const copyRoomUrl = () => {
        if (roomUrl) {
            navigator.clipboard.writeText(roomUrl).then(() => {
                alert("Room URL copied to clipboard!");
            }).catch((error) => {
                console.error("Failed to copy URL:", error);
            });
        }
    };

    // Show loading while checking access
    if (accessChecking) {
        return (
            <div className="flex flex-1 items-center justify-center text-xl bg-gray-800 text-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <div>Verifying access...</div>
                </div>
            </div>
        );
    }

    // Show access denied if user is not registered
    if (!hasAccess) {
        return (
            <div className="flex flex-1 items-center justify-center bg-gray-800 text-white">
                <div className="text-center max-w-md mx-auto p-8">
                    <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Hand className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
                    <p className="text-gray-300 mb-6">
                        You must be registered for this webinar to access the live session.
                    </p>
                    {webinar && (
                        <div className="bg-gray-700 rounded-lg p-4 mb-6">
                            <h3 className="font-semibold text-lg mb-2">{webinar.name}</h3>
                            <p className="text-sm text-gray-300">
                                {new Date(webinar.date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    )}
                    <Button
                        onClick={() => navigate('/royal-tv')}
                        className="bg-primary hover:bg-royal-blue-dark text-white px-6 py-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Webinars
                    </Button>
                </div>
            </div>
        );
    }

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
        <div className="flex flex-col h-full w-full">
            {/* Main Meeting Area */}
            <div className="flex flex-1 overflow-hidden">
                <div id="daily-video-container" className={`flex-1 flex items-center justify-center bg-black ${joined ? "" : "p-4"}`}>
                    {joined && (
                        <div className=" h-full flex  flex-col">
                            <div className="flex-grow flex items-center justify-center relative w-full h-full">
                                {/* Main Video Display: Prioritize screenshare, then local admin camera */}
                                {screenshareTrack && (
                                    <video
                                        ref={(videoElement) => {
                                            if (videoElement && screenshareTrack) {
                                                videoElement.srcObject = new MediaStream([screenshareTrack]);
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                )}
                                {!screenshareTrack && localAdminVideoTrack && (
                                    <video
                                        ref={(videoElement) => {
                                            if (videoElement && localAdminVideoTrack) {
                                                videoElement.srcObject = new MediaStream([localAdminVideoTrack]);
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {!screenshareTrack && !localAdminVideoTrack && ( // Display a message if no screenshare and no local admin camera
                                    <div className="text-white text-xl">No active video.</div>
                                )}
                                {animatedRaisedHands.size && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-3 animate-bounce transition-opacity duration-500 ease-out">
                                        <Hand size={32} className="text-white" />
                                    </div>
                                )}
                                {/* Name label */}
                                {localAdminVideoTrack && <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    Admin
                                </div>}
                            </div>
                            {/* Smaller Remote Participants (if any, excluding dominant and screenshare owner) */}
                            {participants.length > 1 && (
                                <>
                                    {participants.filter(p => p.id !== participants[0].id).map((p) => (

                                        <Fragment key={p.id}>
                                            {p.audioTrack && (
                                                <audio
                                                    key={p.id}
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
                    {!joined && (
                        <div className="flex flex-col gap-4 items-center justify-center p-4 bg-gray-800 text-white w-full h-full">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h1 className="text-2xl font-bold mb-2">Joining Webinar</h1>
                                {webinar && (
                                    <div className="text-center mb-4">
                                        <h2 className="text-lg font-semibold mb-2">{webinar.name}</h2>
                                        <p className="text-gray-300 text-sm">
                                            {new Date(webinar.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                                <p className="text-gray-300">Please wait while we connect you to the live session...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebars for Chat and People */}
                {joined && (
                    <div className="flex border-l bg-gray-900 text-white">
                        {showPeoplePanel && <PeoplePanel onClose={() => setShowPeoplePanel(false)} />}
                        <div className="w-80 p-4 flex flex-col">
                            <ChatBox />
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Control Bar */}
            <MeetingControlsBar position="bottom" togglePeoplePanel={() => setShowPeoplePanel(prev => !prev)} localParticipant={localParticipant} hasLocalAudioPermission={hasLocalAudioPermission} />
        </div>
    );
};
