import React from 'react';
import { Button } from "../../ui/button";
import { LayoutGrid, Users, MonitorPlay, LogOut, Mic, MicOff, Video, VideoOff, Filter, Hand, MessageSquare, MessageSquareX, Maximize, Minimize } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { BackgroundFilterModal } from '../BackgroundFilterModal';

interface MeetingControlsBarProps {
  position: "top" | "bottom";
  togglePeoplePanel: () => void;
  toggleChatBox: () => void;
  showChatBox: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  localParticipant: any;
  chatUnreadCount?: number;
}

export const MeetingControlsBar: React.FC<MeetingControlsBarProps> = ({
  position,
  togglePeoplePanel,
  toggleChatBox,
  showChatBox,
  toggleFullscreen,
  isFullscreen,
  localParticipant,
  chatUnreadCount = 0
}) => {
  const {
    joined,
    role,
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
    hasLocalAudioPermission, // ✅ use context directly
    canUserControlAudio,
  } = useDailyMeeting();

  if (!joined) return null;

  const raisedHandsCount = raisedHands.size;

  // For users, audio is disabled by default unless explicitly granted by admin
  // For admins and guests, use the normal permission check
  const hasAudioPermission = role === "User"
    ? (hasLocalAudioPermission && localParticipant?.permissions?.canSend === true)
    : hasLocalAudioPermission;

  return (
    <div className={`flex justify-center items-center p-4 bg-gray-800 text-white ${position === "top" ? "justify-between" : "gap-8"}`}>
      {position === "top" && (
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Waiting for others to join</span>
        </div>
      )}

      <div className="flex items-center gap-2">
        {position === "top" && role === "User" && (
          <div className="flex gap-4">
            {!isRecording ? (
              <Button variant="ghost" className="text-white" onClick={startRecording}>Start Recording</Button>
            ) : (
              <Button variant="ghost" className="text-white" onClick={stopRecording}>Stop Recording</Button>
            )}
            <span className="text-sm text-white">{isRecording ? "Recording..." : "Not Recording"}</span>
          </div>
        )}

        {position === "top" && <Button variant="ghost" className="text-white"><LayoutGrid className="mr-2" />Speaker view</Button>}

        {position === "bottom" && (
          <>
            <Button
              variant="secondary"
              onClick={toggleCamera}
              className={`rounded-full p-3 h-auto w-auto ${isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            >
              {isCameraOff ? <VideoOff size={24} /> : <Video size={24} />}
            </Button>

            <Button
              variant="secondary"
              onClick={toggleMicrophone}
              disabled={!canUserControlAudio}
              className={`rounded-full p-3 h-auto w-auto ${isMicrophoneMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white ${!hasAudioPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={
                !canUserControlAudio
                  ? (role === "User" ? 'Raise your hand to request audio permission' : 'Audio permission required')
                  : (isMicrophoneMuted ? 'Unmute microphone' : 'Mute microphone')
              }
            >
              {isMicrophoneMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </Button>

            <Button variant="secondary" onClick={togglePeoplePanel} className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-3 h-auto w-auto relative">
              <Users size={24} />
              {raisedHandsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {raisedHandsCount}
                  <span className="sr-only">users with raised hands</span>
                </span>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={() => (raisedHands.has(dailyRoom?.participants().local.session_id || '') ? lowerHand() : raiseHand())}
              className={`rounded-full p-3 h-auto w-auto ${raisedHands.has(dailyRoom?.participants().local.session_id || '') ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            >
              <Hand size={24} />
            </Button>

            <Button
              variant="secondary"
              onClick={toggleChatBox}
              className={`rounded-full p-3 h-auto w-auto ${showChatBox ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white relative`}
            >
              {showChatBox ? <MessageSquareX size={24} /> : <MessageSquare size={24} />}
              {!showChatBox && chatUnreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                  {chatUnreadCount}
                  <span className="sr-only">unread messages</span>
                </span>
              )}
            </Button>

            <Button
              variant="secondary"
              onClick={toggleFullscreen}
              className={`rounded-full p-3 h-auto w-auto ${isFullscreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white`}
            >
              {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </Button>

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

            <Button onClick={leaveRoom} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white rounded-full p-3 h-auto w-auto">
              <LogOut size={24} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
