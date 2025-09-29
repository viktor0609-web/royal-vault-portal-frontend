import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { X, Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";
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

  console.log("participants", participants)

  return (
    <div className="w-full sm:w-80 lg:w-96 bg-gray-900 text-white p-3 sm:p-4 flex flex-col h-full max-h-[80vh] sm:max-h-none @container/panel">
      <div className="flex justify-between items-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-bold">Participants ({participants.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 sm:h-10 sm:w-10">
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Video thumbnails at top - Responsive grid */}
      <div className="mb-3 sm:mb-4 space-y-2">
        <h3 className="text-xs sm:text-sm font-semibold text-gray-300">Video Thumbnails</h3>
        <div className="grid grid-cols-1 @[320px]/panel:grid-cols-2 @[480px]/panel:grid-cols-1 gap-2">
          {/* Admin video - only show if not in main video */}
          {adminVideoTrack && adminVideoTrack !== mainVideoTrack && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-16 sm:h-20 aspect-video">
              <VideoPlayer track={adminVideoTrack} type="camera" thumbnail={true} />
              <div className="absolute bottom-1 left-1 text-white bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs">
                Admin
              </div>
            </div>
          )}

          {/* Guest video - only show if not in main video and video is enabled */}
          {guestVideoTrack && guestVideoTrack !== mainVideoTrack && participants.find(p => !p.local && !p.permissions.canAdmin)?.video && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-16 sm:h-20 aspect-video">
              <VideoPlayer track={guestVideoTrack} type="camera" thumbnail={true} />
              <div className="absolute bottom-1 left-1 text-white bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs">
                Guest
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 sm:space-y-3">
        {participants
          .sort((a, b) => {
            // Sort order: Admin, Guest, Users
            const getRoleOrder = (participant: any) => {
              if (participant.permissions?.canAdmin) return 0; // Admin first
              if (participant.name.includes("Guest")) return 1; // Guest second
              return 2; // Users last
            };
            return getRoleOrder(a) - getRoleOrder(b);
          })
          .map((p) => {
            // Determine role for display
            const displayName = p.local ? "You (Admin)" : (p.name);

            return (
              <div key={p.id} className="flex items-center justify-between bg-gray-800 p-2 sm:p-3 rounded-md @container/participant">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="font-medium text-sm sm:text-base truncate">{displayName}</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {p.audio ? <Mic size={14} className="sm:w-4 sm:h-4 text-green-500" /> : <MicOff size={14} className="sm:w-4 sm:h-4 text-red-500" />}
                    {p.video ? <Video size={14} className="sm:w-4 sm:h-4 text-green-500" /> : <VideoOff size={14} className="sm:w-4 sm:h-4 text-red-500" />}
                  </div>
                </div>
                {role === "Admin" && p.name.includes("(User)") && (
                  <div className="flex gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => ejectParticipant(p.id)}
                      variant="destructive"
                      className="bg-opacity-50 p-1 h-6 w-auto text-xs sm:h-7 sm:text-sm"
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
