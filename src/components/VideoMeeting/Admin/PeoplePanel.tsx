import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { Mic, MicOff, Video, VideoOff, Hand, X } from "lucide-react";
import { Button } from "../../ui/button";
import { VideoPlayer } from "../VideoPlayer";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const { participants, role, ejectParticipant, toggleParticipantAudioPermission } = useDailyMeeting();

  // Get video tracks for thumbnails - Admin sees Admin and Guest only
  const adminVideoTrack = participants.find(p => p.local)?.videoTrack;
  const guestVideoTrack = participants.find(p => p.name.includes("Guest"))?.videoTrack;

  // Get main video track to avoid duplication
  const mainVideoTrack = guestVideoTrack || adminVideoTrack;

  // Count Admin and Guest participants
  const adminAndGuestCount = participants.filter(p => 
    p.permissions?.canAdmin || (p.name.includes("Guest") && !p.permissions?.canAdmin)
  ).length;

  console.log("participants", participants)

  return (
    <div className="w-full sm:w-48 lg:w-56 bg-gray-900 text-white flex flex-col h-full @container/panel relative">
      {/* Close button - visible on mobile only */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-2 right-2 z-50 sm:hidden h-8 w-8 text-white hover:bg-gray-700 rounded-full"
      >
        <X className="h-5 w-5" />
      </Button>
      
      {/* Header with title - visible on mobile */}
      <div className="sm:hidden px-4 py-3 border-b border-gray-700">
        <h2 className="text-lg font-semibold text-white">Participants</h2>
      </div>
      {/* Video thumbnails - fill space only if 4+ participants, otherwise stay at bottom */}
      <div className={`${adminAndGuestCount >= 4 ? 'flex-1' : 'flex-none'} overflow-y-auto p-0 sm:mb-2 mb-0`}>
        <div className={`grid grid-cols-1 gap-0 ${adminAndGuestCount >= 4 ? 'h-full' : ''}`}>
          {/* Admin video - always show first */}
          {participants.find(p => p.permissions?.canAdmin) && (() => {
            const admin = participants.find(p => p.permissions?.canAdmin);
            const adminName = admin?.name || "Admin";
            // Extract name and role from format like "John (Admin)" or just use the name
            const nameMatch = adminName.match(/^(.+?)\s*\((.+?)\)$/);
            const displayName = nameMatch ? `${nameMatch[1]} (${nameMatch[2]})` : `${adminName} (Admin)`;
            return (
              <div className={`relative bg-gray-800 overflow-hidden ${adminAndGuestCount >= 4 ? 'flex-1 min-h-0' : 'h-32'} group`}>
                <VideoPlayer
                  track={admin?.video ? adminVideoTrack : null}
                  type="camera"
                  thumbnail={true}
                  participantName={adminName}
                  showAvatarWhenOff={true}
                />
                {/* Status indicators - top right corner */}
                <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${admin?.audio ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {admin?.audio ? <Mic size={12} className="text-white" /> : <MicOff size={12} className="text-white" />}
                  </div>
                  <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${admin?.video ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                    {admin?.video ? <Video size={12} className="text-white" /> : <VideoOff size={12} className="text-white" />}
                  </div>
                </div>
                {/* Name label - bottom with gradient overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2">
                  <span className="text-white text-xs font-medium truncate block">{displayName}</span>
                </div>
              </div>
            );
          })()}

          {/* All Guest videos - show after Admin */}
          {participants
            .filter(p => p.name.includes("Guest") && !p.permissions?.canAdmin)
            .map((guest) => {
              const guestName = guest.name || "Guest";
              // Extract name and role from format like "John (Guest)" or just use the name
              const nameMatch = guestName.match(/^(.+?)\s*\((.+?)\)$/);
              const displayName = nameMatch ? `${nameMatch[1]} (${nameMatch[2]})` : `${guestName} (Guest)`;
              return (
                <div key={guest.id} className={`relative bg-gray-800 overflow-hidden ${adminAndGuestCount >= 4 ? 'flex-1 min-h-0' : 'h-32'} group`}>
                  <VideoPlayer
                    track={guest.video ? guest.videoTrack : null}
                    type="camera"
                    thumbnail={true}
                    participantName={guestName}
                    showAvatarWhenOff={true}
                  />
                  {/* Status indicators - top right corner */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 z-10">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${guest.audio ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                      {guest.audio ? <Mic size={12} className="text-white" /> : <MicOff size={12} className="text-white" />}
                    </div>
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full backdrop-blur-sm ${guest.video ? 'bg-green-500/80' : 'bg-red-500/80'}`}>
                      {guest.video ? <Video size={12} className="text-white" /> : <VideoOff size={12} className="text-white" />}
                    </div>
                  </div>
                  {/* Bottom overlay with name and eject button */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2 flex items-center justify-between gap-2">
                    <span className="text-white text-xs font-medium truncate flex-1">{displayName}</span>
                    {/* Eject button for Admin - bottom right */}
                    {role === "Admin" && (
                      <Button
                        size="sm"
                        onClick={() => ejectParticipant(guest.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700 h-6 px-2 text-xs flex-shrink-0"
                      >
                        Eject
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Participant list - only show Users */}
      <div className="flex-1 overflow-y-auto space-y-1 p-0 sm:p-0 px-2 sm:px-0">
        {participants
          .filter(p => !p.permissions?.canAdmin && !p.name.includes("Guest"))
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
                {role === "Admin" && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => ejectParticipant(p.id)}
                      variant="destructive"
                      className="bg-opacity-50 p-1 h-5 w-auto text-xs"
                    >
                      Eject
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
