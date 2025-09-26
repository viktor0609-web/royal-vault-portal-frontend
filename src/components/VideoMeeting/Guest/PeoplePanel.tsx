import React from 'react';
import { Button } from "../../ui/button";
import { X, Users, Mic, MicOff, Video, VideoOff, Hand } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";

interface PeoplePanelProps {
    onClose: () => void;
}

export const PeoplePanel: React.FC<PeoplePanelProps> = ({ onClose }) => {
    const { participants, raisedHands, lowerParticipantHand } = useDailyMeeting();

    return (
        <div className="w-80 bg-gray-800 text-white border-l border-gray-700 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-2">
                    <Users size={20} />
                    <h3 className="font-semibold">Participants ({participants.length})</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                >
                    <X size={20} />
                </Button>
            </div>

            {/* Participants List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {participants.map((participant) => (
                    <div
                        key={participant.id}
                        className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                {participant.name?.charAt(0)?.toUpperCase() || 'G'}
                            </div>
                            <div>
                                <p className="font-medium text-sm">
                                    {participant.name || 'Guest'}
                                    {participant.local && <span className="text-blue-400 ml-1">(You)</span>}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className="flex items-center gap-1">
                                        {participant.audioTrack ? (
                                            <Mic size={12} className="text-green-400" />
                                        ) : (
                                            <MicOff size={12} className="text-red-400" />
                                        )}
                                        {participant.videoTrack ? (
                                            <Video size={12} className="text-green-400" />
                                        ) : (
                                            <VideoOff size={12} className="text-red-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Raised hand indicator */}
                        {participant.userData?.raisedHand && (
                            <div className="flex items-center gap-1 text-yellow-400">
                                <Hand size={16} />
                                <span className="text-xs">Hand raised</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 text-center">
                    You're viewing as a guest. Some features may be limited.
                </p>
            </div>
        </div>
    );
};
