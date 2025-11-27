import React, { useState, useEffect, useRef } from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { Mic, MicOff, Video, VideoOff, X } from "lucide-react";
import { Button } from "../../ui/button";
import { VideoPlayer } from "../VideoPlayer";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const { participants } = useDailyMeeting();
  const [activeTab, setActiveTab] = useState("thumbnails");
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const speakingUserRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Get participants for thumbnails: Admin, Guest, and Users who are speaking
  const thumbnailParticipants = participants.filter(p =>
    p.permissions?.canAdmin ||
    (p.name.includes("Guest") && !p.permissions?.canAdmin) ||
    (!p.permissions?.canAdmin && !p.name.includes("Guest") && p.speaking)
  );

  // Find the active speaker (person currently speaking)
  const activeSpeaker = participants.find(p => p.speaking);

  // Count Admin and Guest participants (for layout purposes)
  const adminAndGuestCount = participants.filter(p =>
    p.permissions?.canAdmin || (p.name.includes("Guest") && !p.permissions?.canAdmin)
  ).length;

  // Count Users (attendees) for the list
  const userParticipants = participants.filter(p => !p.permissions?.canAdmin && !p.name.includes("Guest"));
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
        <div className="px-2 sm:px-2 pt-2 border-b border-gray-700">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger
              value="thumbnails"
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Hosts
            </TabsTrigger>
            <TabsTrigger
              value="list"
              className="text-white data-[state=active]:bg-gray-700 data-[state=active]:text-white"
            >
              Viewers ({attendeeCount})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Thumbnails Tab */}
        <TabsContent value="thumbnails" className="flex-1 overflow-y-auto p-0 mt-0">
          <div ref={thumbnailContainerRef} className="grid grid-cols-1 gap-0">
            {/* Render all thumbnail participants in order: Admin, Guest, then speaking Users */}
            {thumbnailParticipants
              .sort((a, b) => {
                // Admin first
                if (a.permissions?.canAdmin && !b.permissions?.canAdmin) return -1;
                if (!a.permissions?.canAdmin && b.permissions?.canAdmin) return 1;
                // Guest second
                if (a.name.includes("Guest") && !b.name.includes("Guest")) return -1;
                if (!a.name.includes("Guest") && b.name.includes("Guest")) return 1;
                // Speaking users last
                return 0;
              })
              .map((participant) => {
                const isAdmin = participant.permissions?.canAdmin;
                const isGuest = participant.name.includes("Guest") && !isAdmin;
                const isUser = !isAdmin && !isGuest;
                const isActiveSpeaker = activeSpeaker?.id === participant.id;

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
                    className="relative bg-gray-800 overflow-hidden h-32 group"
                  >
                    {/* Active speaker indicator - red border */}
                    {isActiveSpeaker && (
                      <div className="absolute inset-0 border-4 border-red-500 z-20 pointer-events-none animate-pulse" />
                    )}
                    <VideoPlayer
                      track={participant.video ? participant.videoTrack : null}
                      type="camera"
                      thumbnail={true}
                      participantName={participantName}
                      showAvatarWhenOff={true}
                    />
                    {/* Status indicators - top right corner */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${participant.audio ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                        {participant.audio ? <Mic size={12} className="text-white" /> : <MicOff size={12} className="text-white" />}
                      </div>
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${participant.video ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                        {participant.video ? <Video size={12} className="text-white" /> : <VideoOff size={12} className="text-white" />}
                      </div>
                    </div>
                    {/* Name label - bottom with gradient overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2">
                      <span className="text-white text-xs font-medium truncate block">{displayName}</span>
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
                const displayName = nameMatch ? nameMatch[1] : p.name;

                return (
                  <div key={p.id} className="flex items-center justify-between bg-gray-800 p-2 @container/participant">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="font-medium text-xs sm:text-sm truncate" title={displayName}>{displayName}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {p.audio ? <Mic size={12} className="sm:w-3 sm:h-3 text-green-500" /> : <MicOff size={12} className="sm:w-3 sm:h-3 text-red-500" />}
                        {p.video ? <Video size={12} className="sm:w-3 sm:h-3 text-green-500" /> : <VideoOff size={12} className="sm:w-3 sm:h-3 text-red-500" />}
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
