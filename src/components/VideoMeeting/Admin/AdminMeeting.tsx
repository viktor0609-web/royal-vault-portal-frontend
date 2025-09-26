import { Button } from "../../ui/button";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { ChatBox } from "../ChatBox";
import { PreJoinScreen } from "../PreJoinScreen";
import { MeetingControlsBar } from "./MeetingControlsBar";
import { Mic, MicOff, Hand } from "lucide-react";
import { PeoplePanel } from "./PeoplePanel";
import { useState, useEffect, useRef, Fragment, useMemo } from "react";

export const AdminMeeting = () => {
    const {
        roomUrl,
        joined,
        participants,
        isManager,
        setIsManager,
        setRoomUrl,
        joinRoom,
        createRoom,
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
    const [showChatBox, setShowChatBox] = useState<boolean>(true);
    const [animatedRaisedHands, setAnimatedRaisedHands] = useState<Set<string>>(
        new Set()
    );
    const animationTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

    // Video/Audio refs
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const localTrackRef = useRef<MediaStreamTrack | null>(null);
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

    // Attach local video
    useEffect(() => {
        const updateLocalVideo = () => {
            const localTrack = participants.find(p => p.local)?.videoTrack;
            if (localVideoRef.current && localTrack && localTrackRef.current !== localTrack) {
                localVideoRef.current.srcObject = new MediaStream([localTrack]);
                localTrackRef.current = localTrack; // remember current track
            }
        };

        updateLocalVideo(); // run immediately

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
        <div className="flex flex-col h-full w-full min-h-0 max-w-full">
            <div className="flex flex-1 overflow-hidden min-h-0 max-w-full">
                <div
                    id="daily-video-container"
                    className={`flex-1 flex items-center justify-center bg-black min-h-0 max-w-full ${joined ? "" : "p-4"
                        }`}
                >
                    {joined && (
                        <div className="h-full flex flex-col min-h-0 max-w-full">
                            <div className="flex-grow flex items-center justify-center relative w-full h-full min-h-0 max-w-full">
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
                            <h1 className="text-3xl font-bold mb-4">Welcome to the Meeting</h1>
                            <div className="flex flex-col gap-4 w-full max-w-md">
                                <Button onClick={createRoom}>Create Room</Button>
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
                                <Button onClick={joinRoom} disabled={!roomUrl}>
                                    Join Room
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {joined && showChatBox && (
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
                toggleChatBox={() => setShowChatBox((prev) => !prev)}
                showChatBox={showChatBox}
            />
        </div>
    );
};
