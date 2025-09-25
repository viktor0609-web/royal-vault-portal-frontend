import React from 'react';
import { Button } from "../../ui/button";
import { LayoutGrid, Users, MonitorPlay, LogOut, Mic, MicOff, Video, VideoOff, Filter, Hand, VolumeX, Volume2 } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { BackgroundFilterModal } from '../BackgroundFilterModal';

interface MeetingControlsBarProps {
  position: "top" | "bottom";
  togglePeoplePanel: () => void;
}

export const MeetingControlsBar: React.FC<MeetingControlsBarProps> = React.memo(({ position, togglePeoplePanel }) => {
  const {
    joined,
    isManager,
    isRecording,
    startRecording,
    stopRecording,
    leaveRoom,
    toggleCamera,
    toggleMicrophone,
    isMicrophoneMuted,
    isCameraOff,
    isScreensharing,
    startScreenshare,
    stopScreenshare,
    raisedHands,
    raiseHand,
    lowerHand,
    dailyRoom,
    participants,
    muteAllParticipants,
    unmuteAllParticipants,
    toggleMuteAllParticipants,
    allParticipantsMuted,
  } = useDailyMeeting();

  const raisedHandsCount = raisedHands.size;

  if (!joined) return null;

  return (
    <div className={`flex justify-center items-center p-4 bg-gray-800 text-white ${position === "top" ? "justify-between" : "gap-8"}`}>
      {position === "top" && (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Waiting for others to join</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {position === "top" && isManager && (
          <div className="flex gap-4">
            {!isRecording ? (
              <Button variant="ghost" className="text-white" onClick={() => { console.log("Start Recording Clicked"); startRecording(); }}>Start Recording</Button>
            ) : (
              <Button variant="ghost" className="text-white" onClick={() => { console.log("Stop Recording Clicked"); stopRecording(); }}>Stop Recording</Button>
            )}
            <span className="text-sm text-white">{isRecording ? "Recording..." : "Not Recording"}</span>
          </div>
        )}

        {position === "top" && <Button variant="ghost" className="text-white"><LayoutGrid className="mr-2" />Speaker view</Button>}

        {position === "bottom" && (
          <>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => { console.log("Toggle Camera Clicked"); toggleCamera(); }} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto">
                {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
              </Button>
              <span className="text-sm">Turn off</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => { console.log("Toggle Microphone Clicked"); toggleMicrophone(); }} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto">
                {isMicrophoneMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>
              <span className="text-sm">Mute</span>
            </div>

            {/* Host Controls */}
            {isManager && (
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => { console.log("Toggle Mute All Clicked"); toggleMuteAllParticipants(); }}
                  className={`${allParticipantsMuted ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-full p-3 h-auto w-auto`}
                >
                  {allParticipantsMuted ? <Volume2 size={24} /> : <VolumeX size={24} />}
                </Button>
                <span className="text-sm">{allParticipantsMuted ? 'Unmute All' : 'Mute All'}</span>
              </div>
            )}
            <Button variant="secondary" onClick={togglePeoplePanel} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto relative">
              <Users size={24} />
              {raisedHandsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {raisedHandsCount}
                  <span className="sr-only">users with raised hands</span>
                </span>
              )}
            </Button>
            {/* Remove raise hand button for host - hosts don't need to raise hands */}
            {!isScreensharing ? (
              <Button variant="secondary" onClick={startScreenshare} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto">
                <MonitorPlay size={24} />
              </Button>
            ) : (
              <Button variant="secondary" onClick={stopScreenshare} className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 h-auto w-auto">
                <MonitorPlay size={24} />
              </Button>
            )}
            <BackgroundFilterModal>
              <Button variant="secondary" className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto">
                <Filter size={24} />
              </Button>
            </BackgroundFilterModal>
            <Button onClick={() => { console.log("Leave Room Clicked"); leaveRoom(); }} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 h-auto w-auto">
              <LogOut size={24} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
});
