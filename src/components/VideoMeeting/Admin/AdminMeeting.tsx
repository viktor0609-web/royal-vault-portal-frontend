import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { Mic, MicOff, Hand } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment } from "react";

export const AdminMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
        isManager,
        setIsManager,
        setRoomUrl,
        joinRoom,
        ejectParticipant,
        toggleParticipantAudio,
        isPermissionModalOpen,
        isLoading,
        isScreensharing,
        screenshareParticipantId,
        raisedHands,
        dailyRoom
    } = useDailyMeeting();

    const [showPeoplePanel, setShowPeoplePanel] = useState<boolean>(false);
    const [animatedRaisedHands, setAnimatedRaisedHands] = useState<Set<string>>(
        new Set()
    );
    const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Video/Audio refs
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const screenshareRef = useRef<HTMLVideoElement | null>(null);
    const mainAudioRef = useRef<HTMLAudioElement | null>(null);
    const remoteAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

    // Tracks
    const localAdminVideoTrack = participants.find((p) => p.local)?.videoTrack;
    const screenshareTrack = isScreensharing
        ? participants.find((p) => p.id === screenshareParticipantId)
            ?.screenVideoTrack
        : null;

    useEffect(() => {
        setIsManager(true);
    }, [setIsManager]);

    // Auto-join the room on component mount
    useEffect(() => {
        const dailyRoomUrl = import.meta.env.VITE_DAILY_ROOM_URL;
        console.log('Admin - Daily room URL:', dailyRoomUrl);
        if (dailyRoomUrl && !joined) {
            console.log('Admin - Setting room URL:', dailyRoomUrl);
            setRoomUrl(dailyRoomUrl);
            // Auto-join after a short delay
            setTimeout(() => {
                console.log('Admin - Attempting to join room with URL:', dailyRoomUrl);
                joinRoom();
            }, 1000);
        }
    }, [setRoomUrl, joinRoom, joined]);

    // Attach local video
    useEffect(() => {
        const updateLocalVideo = () => {
            const localTrack = participants.find(p => p.local)?.videoTrack;
            if (localVideoRef.current && localTrack) {
                localVideoRef.current.srcObject = new MediaStream([localTrack]);
            }
        };

        updateLocalVideo(); // run immediately

        // listen for participant updates (e.g. when processor changes)
        dailyRoom?.on("participant-updated", updateLocalVideo);

        return () => {
            dailyRoom?.off("participant-updated", updateLocalVideo);
        };
    }, [participants, dailyRoom]);

    // Attach screenshare
    useEffect(() => {
        if (screenshareRef.current && screenshareTrack) {
            screenshareRef.current.srcObject = new MediaStream([screenshareTrack]);
        }
    }, [screenshareTrack]);

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

    // Handle raised hands animation
    useEffect(() => {
        const currentRaisedIds = Array.from(raisedHands);
        const currentlyAnimatedIds = Array.from(animatedRaisedHands);

        currentRaisedIds.forEach((participantId) => {
            if (
                !animatedRaisedHands.has(participantId) &&
                !animationTimeouts.current.has(participantId)
            ) {
                setAnimatedRaisedHands((prev) => new Set(prev).add(participantId));
                const timeoutId = setTimeout(() => {
                    setAnimatedRaisedHands((prev) => {
                        const newSet = new Set(prev);
                        newSet.delete(participantId);
                        return newSet;
                    });
                    animationTimeouts.current.delete(participantId);
                }, 5000);
                animationTimeouts.current.set(participantId, timeoutId);
            }
        });

        currentlyAnimatedIds.forEach((participantId) => {
            if (!raisedHands.has(participantId)) {
                const timeoutId = animationTimeouts.current.get(participantId);
                if (timeoutId) {
                    clearTimeout(timeoutId);
                    animationTimeouts.current.delete(participantId);
                }
                setAnimatedRaisedHands((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(participantId);
                    return newSet;
                });
            }
        });

        return () => {
            animationTimeouts.current.forEach((timeoutId) =>
                clearTimeout(timeoutId)
            );
            animationTimeouts.current.clear();
        };
    }, [raisedHands]);

    const copyRoomUrl = () => {
        if (roomUrl) {
            navigator.clipboard
                .writeText(roomUrl)
                .then(() => {
                    alert("Room URL copied to clipboard!");
                })
                .catch((error) => {
                    console.error("Failed to copy URL:", error);
                });
        }
    };

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
        <div className="flex flex-col h-full w-full">
            <div className="flex flex-1 overflow-hidden">
                <div
                    id="daily-video-container"
                    className={`flex-1 flex items-center justify-center bg-black ${joined ? "" : "p-4"
                        }`}
                >
                    {joined && (
                        <div className="h-full flex flex-col">
                            <div className="flex-grow flex items-center justify-center relative w-full h-full">
                                {/* Screenshare first */}
                                {screenshareTrack && (
                                    <video
                                        ref={screenshareRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-contain"
                                    />
                                )}

                                {/* Local admin video */}
                                {!screenshareTrack && localAdminVideoTrack && (
                                    <video
                                        ref={localVideoRef}
                                        autoPlay
                                        playsInline
                                        className="w-full h-full object-cover"
                                    />
                                )}

                                {/* Fallback */}
                                {!screenshareTrack && !localAdminVideoTrack && (
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

                                {/* Raised hand animation */}
                                {animatedRaisedHands.size > 0 && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 rounded-full p-3 animate-bounce transition-opacity duration-500 ease-out">
                                        <Hand size={32} className="text-white" />
                                    </div>
                                )}

                                {/* Name label */}
                                {localAdminVideoTrack && <div className="absolute bottom-2 left-2 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                                    {participants[0]?.local
                                        ? `You:${participants[0]?.name}`
                                        : participants[0]?.name || participants[0]?.id}
                                </div>}

                                {/* Admin controls */}
                                {isManager && !participants[0]?.local && (
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <Button
                                            size="sm"
                                            onClick={() => toggleParticipantAudio(participants[0].id)}
                                            variant="secondary"
                                            className="bg-opacity-50"
                                        >
                                            {participants[0]?.audioTrack ? <Mic /> : <MicOff />}
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => ejectParticipant(participants[0].id)}
                                            variant="destructive"
                                            className="bg-opacity-50"
                                        >
                                            Eject
                                        </Button>
                                    </div>
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

                    {!joined && (
                        <div className="flex flex-col gap-4 items-center justify-center p-4 bg-gray-800 text-white w-full h-full">
                            <div className="text-center">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <h1 className="text-2xl font-bold mb-2">Joining Admin Room</h1>
                                <p className="text-gray-300">Please wait while we connect you to the admin session...</p>
                            </div>
                        </div>
                    )}
                </div>

                {joined && (
                    <div className="flex border-l bg-gray-900 text-white">
                        {showPeoplePanel && (
                            <PeoplePanel onClose={() => setShowPeoplePanel(false)} />
                        )}
                        <div className="w-80 p-4 flex flex-col">
                            <ChatBox />
                        </div>
                    </div>
                )}
            </div>

            <MeetingControlsBar
                position="bottom"
                togglePeoplePanel={() => setShowPeoplePanel((prev) => !prev)}
            />
        </div>
    );
};
