import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { X, Mic, MicOff, Video, VideoOff, Hand, Monitor, Star } from "lucide-react";
import { Button } from "../../ui/button";

interface PeoplePanelProps {
  onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
  const {
    participants,
    isManager,
    ejectParticipant,
    toggleParticipantAudioPermission,
    raisedHands,
    lowerParticipantHand,
    setMainScreenParticipant,
    mainScreenParticipantId
  } = useDailyMeeting();

  return (
    <div className="w-80 bg-gray-900 text-white p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Participants ({participants.length})</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3">
        {participants.map((p) => (
          <div key={p.id} className={`flex items-center justify-between p-3 rounded-md ${mainScreenParticipantId === p.id ? 'bg-blue-600' : 'bg-gray-800'}`}>
            <div className="flex items-center gap-2">
              <span className="font-medium">{p.local ? "You (Host)" : p.name || `Guest ${p.id.substring(0, 4)}`}</span>
              {p.audioTrack ? <Mic size={16} className="text-green-500" /> : <MicOff size={16} className="text-red-500" />}
              {p.videoTrack ? <Video size={16} className="text-green-500" /> : <VideoOff size={16} className="text-red-500" />}
              {raisedHands.has(p.id) && (
                <div className="flex items-center gap-1">
                  <Hand size={16} className="text-blue-500" />
                  {isManager && !p.local && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto w-auto text-xs"
                      onClick={() => lowerParticipantHand(p.id)}
                    >
                      Lower Hand
                    </Button>
                  )}
                </div>
              )}
              {mainScreenParticipantId === p.id && (
                <Star size={16} className="text-yellow-500" />
              )}
            </div>
            {isManager && (
              <div className="flex gap-1">
                {/* Set as main screen */}
                <Button
                  size="sm"
                  onClick={() => setMainScreenParticipant(p.id)}
                  variant={mainScreenParticipantId === p.id ? "default" : "secondary"}
                  className="p-1 h-auto w-auto"
                  disabled={p.local}
                >
                  <Monitor size={16} />
                </Button>
                {/* Individual mute control */}
                {!p.local && (
                  <Button
                    size="sm"
                    onClick={() => toggleParticipantAudioPermission(p.id)}
                    variant="secondary"
                    className="p-1 h-auto w-auto"
                  >
                    {p.permissions?.canSend === true ? <Mic size={16} /> : <MicOff size={16} />}
                  </Button>
                )}
                {/* Eject participant */}
                {!p.local && (
                  <Button
                    size="sm"
                    onClick={() => ejectParticipant(p.id)}
                    variant="destructive"
                    className="p-1 h-auto w-auto"
                  >
                    Eject
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
