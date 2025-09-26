import React from 'react';
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { X, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Button } from "../../ui/button";

interface PeoplePanelProps {
    onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
    const { participants } = useDailyMeeting();

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
                    <div key={p.id} className="flex items-center justify-between bg-gray-800 p-2 rounded-md">
                        <div className="flex items-center gap-2">
                            <span className="font-medium">{p.local ? "You" : p.name || `Guest ${p.id.substring(0, 4)}`}</span>
                            {p.audioTrack ? <Mic size={16} className="text-green-500" /> : <MicOff size={16} className="text-red-500" />}
                            {p.videoTrack ? <Video size={16} className="text-green-500" /> : <VideoOff size={16} className="text-red-500" />}
                        </div>
                        {/* Removed manager-specific controls */}
                    </div>
                ))}
            </div>
        </div>
    );
};
