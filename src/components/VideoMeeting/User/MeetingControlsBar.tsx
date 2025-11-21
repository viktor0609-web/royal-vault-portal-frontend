import React from 'react';
import { Button } from "../../ui/button";
import { LayoutGrid, Users, MonitorPlay, LogOut, Mic, MicOff, Video, VideoOff, Settings, Hand, MessageSquare, MessageSquareX, Maximize, Minimize } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { SettingsModal } from '../SettingsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

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
    hasLocalAudioPermission, // ✅ use context directly
  } = useDailyMeeting();

  if (!joined) return null;

  // For users, audio is disabled by default unless explicitly granted by admin
  // For admins and guests, use the normal permission check
  const hasAudioPermission = hasLocalAudioPermission;

  return (
    <TooltipProvider>
      <div className={`hidden md:flex flex-col border-t-2 border-gray-600 sm:flex-row justify-center items-center p-2 sm:p-4 bg-gray-800 text-white gap-2 sm:gap-4 ${position === "top" ? "justify-between" : ""}`}>
        {position === "top" && (
          <div className="flex items-center gap-2 order-1 sm:order-none">
            <span className="text-sm sm:text-lg font-semibold">Waiting for others to join</span>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center @container/controls">
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={toggleCamera}
                    className={`rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${isCameraOff ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-all duration-200`}
                  >
                    {isCameraOff ? <VideoOff size={20} className="sm:w-6 sm:h-6" /> : <Video size={20} className="sm:w-6 sm:h-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCameraOff ? "Turn Camera On" : "Turn Camera Off"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={toggleMicrophone}
                    disabled={!hasAudioPermission}
                    className={`rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${isMicrophoneMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white ${!hasAudioPermission ? 'opacity-50 cursor-not-allowed' : ''} transition-all duration-200`}
                  >
                    {isMicrophoneMuted ? <MicOff size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {!hasAudioPermission
                      ? (role === "User" ? 'Raise your hand to request speaking permission' : 'Audio permission required')
                      : (isMicrophoneMuted ? 'Unmute microphone' : 'Mute microphone')}
                  </p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={togglePeoplePanel}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                  >
                    <Users size={20} className="sm:w-6 sm:h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Participants</p>
                </TooltipContent>
              </Tooltip>

              {/* Chat toggle button - only visible on mobile */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={toggleChatBox}
                    className={`sm:hidden rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${showChatBox ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white relative transition-all duration-200`}
                  >
                    {showChatBox ? <MessageSquareX size={20} className="sm:w-6 sm:h-6" /> : <MessageSquare size={20} className="sm:w-6 sm:h-6" />}
                    {!showChatBox && chatUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full min-w-[18px] h-[18px]">
                        {chatUnreadCount}
                        <span className="sr-only">unread messages</span>
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showChatBox ? "Close Chat" : "Open Chat"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={toggleFullscreen}
                    className={`rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${isFullscreen ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-all duration-200`}
                  >
                    {isFullscreen ? <Minimize size={20} className="sm:w-6 sm:h-6" /> : <Maximize size={20} className="sm:w-6 sm:h-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Simple hand button - you can add your own logic here
                      console.log('Hand button clicked');
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                  >
                    <Hand size={20} className="sm:w-6 sm:h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Raise Hand</p>
                </TooltipContent>
              </Tooltip>

              <SettingsModal>
                <Button
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                >
                  <Settings size={20} className="sm:w-6 sm:h-6" />
                </Button>
              </SettingsModal>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      leaveRoom();
                      // Try to close the browser tab
                      setTimeout(() => {
                        window.close();
                        // Fallback: if window.close() doesn't work, navigate away
                        if (!document.hidden) {
                          window.location.href = '/';
                        }
                      }, 500);
                    }}
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                  >
                    <LogOut size={20} className="sm:w-6 sm:h-6" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leave Meeting</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
