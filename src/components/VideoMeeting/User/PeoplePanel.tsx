import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "../../ui/button";
import { VideoPlayer } from "../VideoPlayer";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const { participants } = useDailyMeeting();

  // Get video tracks for thumbnails - User sees all three roles
  const adminVideoTrack = participants.find(p => p.name.includes("Admin"))?.videoTrack;
  const guestVideoTrack = participants.find(p => p.name.includes("Guest"))?.videoTrack;
  const userVideoTrack = participants.find(p => p.local)?.videoTrack;

  // Get main video track to avoid duplication
  const mainVideoTrack = guestVideoTrack || adminVideoTrack || userVideoTrack;

  // Count Admin and Guest participants
  const adminAndGuestCount = participants.filter(p => 
    p.permissions?.canAdmin || (p.name.includes("Guest") && !p.permissions?.canAdmin)
  ).length;

  return (
    <div className="w-full sm:w-48 lg:w-56 bg-gray-900 text-white flex flex-col h-full @container/panel relative">
      {/* Video thumbnails - fill space only if 4+ participants, otherwise stay at bottom */}
      <div className={`${adminAndGuestCount >= 4 ? 'flex-1' : 'flex-none'} overflow-y-auto p-0 mb-2`}>
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
                  {/* Name label - bottom with gradient overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent px-2 py-2">
                    <span className="text-white text-xs font-medium truncate block">{displayName}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
