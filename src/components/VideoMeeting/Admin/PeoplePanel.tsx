import React, { useState, useEffect, useRef } from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { Mic, MicOff, Video, VideoOff, Hand, X } from "lucide-react";
import { Button } from "../../ui/button";
import { VideoPlayer } from "../VideoPlayer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const { participants, role, ejectParticipant, toggleParticipantAudioPermission, toggleParticipantAudio, toggleParticipantVideo, lowerHand, raisedHands } = useDailyMeeting();
  const [activeTab, setActiveTab] = useState("thumbnails");
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const speakingUserRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get video tracks for thumbnails - Admin sees Admin and Guest only
  const adminVideoTrack = participants.find(p => p.local)?.videoTrack;
  const guestVideoTrack = participants.find(p => p.name.includes("Guest"))?.videoTrack;

  // Get main video track to avoid duplication
  const mainVideoTrack = guestVideoTrack || adminVideoTrack;

  // Get participants for thumbnails: Admin, Guest, Users who are speaking, and Users with raised hands
  // Exclude developer: Viktor Lypianets (viktor@royallegalsolutions.com)
  const thumbnailParticipants = participants.filter(p => {
    const participantName = p.name?.toLowerCase() || "";
    const isDeveloper = participantName.includes("viktor lypianets") ||
      participantName.includes("viktor@royallegalsolutions.com");
    if (isDeveloper) return false;

    return p.permissions?.canAdmin ||
      (p.name.includes("Guest") && !p.permissions?.canAdmin) ||
      (!p.permissions?.canAdmin && !p.name.includes("Guest") && (p.speaking || p.handRaised));
  });

  // Find the active speaker (person currently speaking)
  // Exclude developer: Viktor Lypianets (viktor@royallegalsolutions.com)
  const activeSpeaker = participants.find(p => {
    const participantName = p.name?.toLowerCase() || "";
    const isDeveloper = participantName.includes("viktor lypianets") ||
      participantName.includes("viktor@royallegalsolutions.com");
    return p.speaking && !isDeveloper;
  });

  // Count Admin and Guest participants (for layout purposes)
  const adminAndGuestCount = participants.filter(p =>
    p.permissions?.canAdmin || (p.name.includes("Guest") && !p.permissions?.canAdmin)
  ).length;

  // Count Users (attendees) for the list
  // Exclude developer: Viktor Lypianets (viktor@royallegalsolutions.com)
  const userParticipants = participants.filter(p => {
    const participantName = p.name?.toLowerCase() || "";
    const isDeveloper = participantName.includes("viktor lypianets") ||
      participantName.includes("viktor@royallegalsolutions.com");
    if (isDeveloper) return false;

    return !p.permissions?.canAdmin && !p.name.includes("Guest");
  });
  const attendeeCount = userParticipants.length;

  // Auto-scroll to speaking user when they start speaking
  useEffect(() => {
    if (activeTab !== "thumbnails" || !activeSpeaker) return;

    // Only scroll if the active speaker is a User (not Admin or Guest)
    const isUser = !activeSpeaker.permissions?.canAdmin && !activeSpeaker.name.includes("Guest");
    if (!isUser) return;

    // Wait a bit for the DOM to update
    const timeoutId = setTimeout(() => {
      const thumbnailElement = speakingUserRefs.current.get(activeSpeaker.id);
      if (thumbnailElement && thumbnailContainerRef.current) {
        thumbnailElement.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [activeSpeaker?.id, activeTab]);

  // Debug: log participants with raised hands
  console.log("participants", participants)
  console.log("participants with raised hands", participants.filter(p => p.handRaised))
  console.log("role", role)

  return (
    <div className="w-full sm:w-48 lg:w-56 bg-gray-900 text-white flex flex-col h-full min-h-0 @container/panel relative">
      {/* Close button - visible on desktop only (mobile uses BottomSheet close) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="hidden sm:block absolute top-2 right-2 z-50 h-8 w-8 text-white hover:bg-gray-700 rounded-full"
      >
        <X className="h-5 w-5" />
      </Button>

      {/* Header with title - visible on desktop only (mobile uses BottomSheet title) */}
      <div className="hidden sm:block px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Participants</h2>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        {/* Sticky tabs - sticky on mobile, normal on desktop */}
        <div className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 px-2 pt-2 pb-2">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="thumbnails"
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              Hosts
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              Viewers ({attendeeCount})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Thumbnails Tab */}
        <TabsContent value="thumbnails" className="flex-1 overflow-y-auto p-0 mt-0">
          <div ref={thumbnailContainerRef} className="grid grid-cols-1 gap-0">
            {/* Render all thumbnail participants: Guest and Users first, Admin at the bottom */}
            {thumbnailParticipants
              .sort((a, b) => {
                // Admin last (at the bottom of the list)
                if (a.permissions?.canAdmin && !b.permissions?.canAdmin) return 1;
                if (!a.permissions?.canAdmin && b.permissions?.canAdmin) return -1;
                // Guest first, then users
                if (a.name.includes("Guest") && !b.name.includes("Guest")) return -1;
                if (!a.name.includes("Guest") && b.name.includes("Guest")) return 1;
                return 0;
              })
              .map((participant) => {
                const isAdmin = participant.permissions?.canAdmin;
                const isGuest = participant.name.includes("Guest") && !isAdmin;
                const isUser = !isAdmin && !isGuest;
                const isActiveSpeaker = activeSpeaker?.id === participant.id;

                // Debug: log hand raised status
                if (participant.handRaised) {
                  console.log('Participant with raised hand:', participant.name, participant.id, 'isAdmin:', isAdmin, 'isGuest:', isGuest, 'isUser:', isUser, 'role:', role);
                }

                const participantName = participant.name || (isAdmin ? "Admin" : isGuest ? "Guest" : "User");
                // Extract name and role from format like "John (Admin)" or just use the name
                const nameMatch = participantName.match(/^(.+?)\s*\((.+?)\)$/);
                const displayName = nameMatch
                  ? `${nameMatch[1]} (${nameMatch[2]})`
                  : isAdmin
                    ? `${participantName} (Admin)`
                    : isGuest
                      ? `${participantName} (Guest)`
                      : participantName;

                return (
                  <div
                    key={participant.id}
                    ref={(el) => {
                      if (el && isUser) {
                        speakingUserRefs.current.set(participant.id, el);
                      } else if (!isUser) {
                        speakingUserRefs.current.delete(participant.id);
                      }
                    }}
                    className={`relative bg-gray-800 overflow-hidden h-32 group ${isActiveSpeaker ? 'ring-4 ring-red-500 ring-offset-2 ring-offset-gray-900' : ''
                      }`}
                  >
                    {/* Active speaker indicator - red border */}
                    {isActiveSpeaker && (
                      <div className="absolute inset-0 border-4 border-red-500 z-20 pointer-events-none animate-pulse" />
                    )}
                    {/* Hand raised indicator - top left corner */}
                    {participant.handRaised && (
                      <div className="absolute top-2 left-2 z-10 bg-yellow-500 rounded-full p-1.5 shadow-lg">
                        <Hand size={14} className="text-white" />
                      </div>
                    )}
                    <VideoPlayer
                      track={participant.video ? participant.videoTrack : null}
                      type="camera"
                      thumbnail={true}
                      participantName={participantName}
                      showAvatarWhenOff={true}
                    />
                    {/* Control buttons - top right corner (Admin only) */}
                    {role === "Admin" && (isGuest || isUser) && (
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParticipantAudio(participant.id);
                          }}
                          variant="outline"
                          className={`h-7 w-7 p-0 backdrop-blur-sm border-2 ${participant.audio
                            ? 'bg-green-500/80 hover:bg-green-600/80 border-green-400'
                            : 'bg-red-500/80 hover:bg-red-600/80 border-red-400'
                            }`}
                          title={participant.audio ? "Mute" : "Unmute"}
                        >
                          {participant.audio ? <Mic size={14} className="text-white" /> : <MicOff size={14} className="text-white" />}
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleParticipantVideo(participant.id);
                          }}
                          variant="outline"
                          className={`h-7 w-7 p-0 backdrop-blur-sm border-2 ${participant.video
                            ? 'bg-green-500/80 hover:bg-green-600/80 border-green-400'
                            : 'bg-red-500/80 hover:bg-red-600/80 border-red-400'
                            }`}
                          title={participant.video ? "Turn off camera" : "Turn on camera"}
                        >
                          {participant.video ? <Video size={14} className="text-white" /> : <VideoOff size={14} className="text-white" />}
                        </Button>
                      </div>
                    )}
                    {/* Status indicators - top right corner (for Admin viewing themselves) */}
                    {role === "Admin" && isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${participant.audio ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                          {participant.audio ? <Mic size={12} className="text-white" /> : <MicOff size={12} className="text-white" />}
                        </div>
                        <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${participant.video ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                          {participant.video ? <Video size={12} className="text-white" /> : <VideoOff size={12} className="text-white" />}
                        </div>
                      </div>
                    )}
                    {/* Bottom overlay with name and controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2 flex items-center justify-between gap-2">
                      <span className="text-white text-xs font-medium truncate flex-1">{displayName}</span>
                      {/* Control buttons for Admin - bottom right */}
                      {role === "Admin" && (isGuest || isUser) && (
                        <div className="flex gap-1 flex-shrink-0 items-center">
                          {(participant.handRaised || raisedHands.has(participant.id)) && lowerHand && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log('Lowering hand for:', participant.id, participant.name);
                                if (lowerHand) {
                                  lowerHand(participant.id);
                                }
                              }}
                              variant="outline"
                              className="bg-yellow-600 hover:bg-yellow-700 border-yellow-400 h-7 w-7 p-0 backdrop-blur-sm border-2 z-20"
                              title="Lower Hand"
                            >
                              <Hand size={14} className="text-white" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              ejectParticipant(participant.id);
                            }}
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 h-6 px-2 text-xs flex-shrink-0"
                          >
                            Eject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="flex-1 overflow-y-auto space-y-1 p-2 mt-0">
          {userParticipants.length === 0 ? (
            <div className="text-center text-gray-400 py-8 text-sm">No attendees</div>
          ) : (
            userParticipants
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((p) => {
                // Extract name without role (remove "(User)" or similar)
                const nameMatch = p.name.match(/^(.+?)\s*\(.+?\)$/);
                console.log("nameMatch", p.email)
                const displayName = nameMatch ? nameMatch[1] : p.name;

                return (
                  <div key={p.id} className="flex items-center justify-between bg-gray-800 p-2 @container/participant relative">
                    {/* Hand raised indicator - left side */}
                    {p.handRaised && (
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-yellow-500 rounded-full p-1 shadow-lg">
                        <Hand size={12} className="text-white" />
                      </div>
                    )}
                    <div className={`flex items-center gap-2 min-w-0 flex-1 ${p.handRaised ? 'pl-8' : ''}`}>
                      <span className="font-medium text-xs sm:text-sm truncate" title={displayName}>{displayName}</span>
                    </div>
                    {role === "Admin" && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          onClick={() => toggleParticipantAudio(p.id)}
                          variant="outline"
                          className={`h-6 w-6 p-0 border-2 ${p.audio
                            ? 'bg-green-500/80 hover:bg-green-600/80 border-green-400'
                            : 'bg-red-500/80 hover:bg-red-600/80 border-red-400'
                            }`}
                          title={p.audio ? "Mute" : "Unmute"}
                        >
                          {p.audio ? <Mic size={12} className="text-white" /> : <MicOff size={12} className="text-white" />}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => toggleParticipantVideo(p.id)}
                          variant="outline"
                          className={`h-6 w-6 p-0 border-2 ${p.video
                            ? 'bg-green-500/80 hover:bg-green-600/80 border-green-400'
                            : 'bg-red-500/80 hover:bg-red-600/80 border-red-400'
                            }`}
                          title={p.video ? "Turn off camera" : "Turn on camera"}
                        >
                          {p.video ? <Video size={12} className="text-white" /> : <VideoOff size={12} className="text-white" />}
                        </Button>
                        {(p.handRaised || raisedHands.has(p.id)) && lowerHand && (
                          <Button
                            size="sm"
                            onClick={() => {
                              console.log('Lowering hand for (list):', p.id, p.name);
                              lowerHand(p.id);
                            }}
                            variant="outline"
                            className="bg-yellow-600 hover:bg-yellow-700 border-yellow-400 h-6 w-6 p-0 border-2 z-20"
                            title="Lower Hand"
                          >
                            <Hand size={12} className="text-white" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => ejectParticipant(p.id)}
                          variant="destructive"
                          className="bg-opacity-50 p-1 h-6 w-auto text-xs flex items-center"
                        >
                          Eject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
