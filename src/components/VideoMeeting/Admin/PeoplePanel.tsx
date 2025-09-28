import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { X, Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";
import { Button } from "../../ui/button";
import { VideoPlayer } from "../VideoPlayer";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const { participants, role, ejectParticipant, toggleParticipantAudioPermission, raisedHands, lowerParticipantHand } = useDailyMeeting();

  // Get video tracks for thumbnails - Admin sees Admin and Guest only
  const adminVideoTrack = participants.find(p => p.local && p.permissions.canAdmin)?.videoTrack;
  const guestVideoTrack = participants.find(p => !p.local && !p.permissions.canAdmin)?.videoTrack;

  // Get main video track to avoid duplication
  const mainVideoTrack = guestVideoTrack || adminVideoTrack;

  return (
    <div className="w-80 bg-gray-900 text-white p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Participants ({participants.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Video thumbnails at top */}
      <div className="mb-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-300">Video Thumbnails</h3>
        <div className="grid grid-cols-1 gap-2">
          {/* Admin video - only show if not in main video */}
          {adminVideoTrack && adminVideoTrack !== mainVideoTrack && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-20">
              <VideoPlayer track={adminVideoTrack} type="camera" thumbnail={true} />
              <div className="absolute bottom-1 left-1 text-white bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs">
                Admin
              </div>
            </div>
          )}

          {/* Guest video - only show if not in main video and video is enabled */}
          {guestVideoTrack && guestVideoTrack !== mainVideoTrack && participants.find(p => !p.local && !p.permissions.canAdmin)?.videoTrack && (
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-20">
              <VideoPlayer track={guestVideoTrack} type="camera" thumbnail={true} />
              <div className="absolute bottom-1 left-1 text-white bg-black bg-opacity-50 px-1 py-0.5 rounded text-xs">
                Guest
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3">
        {participants.map((p) => {
          // Determine role for display
          const displayName = p.local ? "You (Admin)" : (p.name);

          return (
            <div key={p.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">{displayName}</span>
                {p.audioTrack ? <Mic size={16} className="text-green-500" /> : <MicOff size={16} className="text-red-500" />}
                {p.videoTrack ? <Video size={16} className="text-green-500" /> : <VideoOff size={16} className="text-red-500" />}
                {raisedHands.has(p.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="p-0 h-auto w-auto"
                    onClick={() => role === "Admin" && !p.local && lowerParticipantHand(p.id)}
                    disabled={role != "Admin" || p.local}
                  >
                    <Hand size={16} className="text-blue-500" />
                  </Button>
                )}
              </div>
              {role === "Admin" && !p.local && (
                <div className="flex gap-1">
                  <Button size="sm" onClick={() => toggleParticipantAudioPermission(p.id)} variant="secondary" className="bg-opacity-50 p-1 h-auto w-auto">
                    {p.permissions?.canSend === true ? <Mic size={16} /> : <MicOff size={16} />}
                  </Button>
                  <Button size="sm" onClick={() => ejectParticipant(p.id)} variant="destructive" className="bg-opacity-50 p-1 h-auto w-auto">
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
