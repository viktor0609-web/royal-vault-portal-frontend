
import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar"; // Import the new MeetingControlsBar
import { Mic, MicOff, Hand } from "lucide-react"; // Import Mic and MicOff icons
import { PeoplePanel } from "./PeoplePanel"; // Import PeoplePanel
import { useState, useEffect, useRef, Fragment } from 'react'; // Added useEffect and useRef

export const UserMeeting = () => {
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
        localParticipant, // Import localParticipant
        hasLocalAudioPermission, // Import hasLocalAudioPermission
    } = useDailyMeeting();
    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [animatedRaisedHands, setAnimatedRaisedHands] = useState<Set<string>>(new Set());
    const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

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
            {/* Top Control Bar */}

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
                            <h1 className="text-3xl font-bold mb-4">Welcome to the Meeting</h1>
                            <div className="flex flex-col gap-4 w-full max-w-md">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter room URL to join"
                                        value={roomUrl}
                                        onChange={(e) => setRoomUrl(e.target.value)}
                                        className="flex-1 p-2 border rounded-md text-black"
                                    />
                                    <Button onClick={copyRoomUrl}>Copy</Button>
                                </div>
                                <Button onClick={joinRoom} disabled={!roomUrl}>Join Room</Button>
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
            <MeetingControlsBar position="bottom" togglePeoplePanel={() => setShowPeoplePanel(prev => !prev)} localParticipant={localParticipant} hasLocalAudioPermission={hasLocalAudioPermission}/>
        </div>
    );
};