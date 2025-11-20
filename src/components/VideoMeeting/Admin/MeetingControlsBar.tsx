import React, { useState, useEffect } from 'react';
import { Button } from "../../ui/button";
import { LayoutGrid, Users, MonitorPlay, LogOut, Mic, MicOff, Video, VideoOff, Settings, MessageSquare, MessageSquareX, Maximize, Minimize, Circle } from "lucide-react";
import { useDailyMeeting } from "../../../context/DailyMeetingContext";
import { SettingsModal } from '../SettingsModal';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useToast } from '../../../hooks/use-toast';
import { webinarApi } from '../../../lib/api';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../ui/tooltip";

interface MeetingControlsBarProps {
  position: "top" | "bottom";
  togglePeoplePanel: () => void;
  toggleChatBox: () => void;
  showChatBox: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  chatUnreadCount?: number;
  countdown?: number | null;
  setCountdown?: (countdown: number | null) => void;
  handleStartRecording?: () => void;
}

export const MeetingControlsBar: React.FC<MeetingControlsBarProps> = ({
  position,
  togglePeoplePanel,
  toggleChatBox,
  showChatBox,
  toggleFullscreen,
  isFullscreen,
  chatUnreadCount = 0,
  countdown: propCountdown,
  setCountdown: propSetCountdown,
  handleStartRecording: propHandleStartRecording,
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
    dailyRoom,
  } = useDailyMeeting();

  // Use props if provided, otherwise use local state (for backward compatibility)
  const [localCountdown, setLocalCountdown] = useState<number | null>(null);
  const countdown = propCountdown !== undefined ? propCountdown : localCountdown;
  const setCountdown = propSetCountdown || setLocalCountdown;
  const handleStartRecording = propHandleStartRecording || (() => {
    console.log("Start Recording Clicked");
    setCountdown(3);
  });

  const { toast } = useToast();
  const { slug } = useParams<{ slug: string }>();

  // Handle countdown timer (only if using local state)
  useEffect(() => {
    if (propCountdown !== undefined) return; // Don't handle if countdown is controlled by parent
    if (countdown === null) return;

    if (countdown === 0) {
      // Countdown finished, start recording
      const startActualRecording = async () => {
        try {
          const response = await webinarApi.setWebinarOnRecording(slug as string);
          if (response.status !== 200) {
            throw new Error('Failed to set webinar on recording');
          }
          startRecording();
          setCountdown(null);
        } catch (error) {
          console.error('Error starting recording:', error);
          toast({
            title: "Error",
            description: "Failed to start recording. Please try again.",
            variant: "destructive",
          });
          setCountdown(null);
        }
      };
      startActualRecording();
      return;
    }

    // Decrease countdown every second
    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, slug, startRecording, toast, propCountdown]);

  // Handle ESC key to cancel countdown
  useEffect(() => {
    if (countdown === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCountdown(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [countdown, setCountdown]);


  if (!joined) return null;

  return (
    <TooltipProvider>
      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-9xl sm:text-[12rem] font-bold text-white animate-pulse">
              {countdown}
            </div>
            <p className="text-2xl sm:text-3xl text-white mt-4 font-semibold">
              Recording will start...
            </p>
            <p className="text-sm sm:text-base text-white/70 mt-2">
              Press ESC to cancel
            </p>
          </div>
        </div>
      )}

      <div className={`hidden md:flex border-t-2 border-gray-600 flex-col sm:flex-row justify-center items-center p-2 sm:p-4 bg-gray-800 text-white flex-shrink-0 gap-2 sm:gap-4 ${position === "top" ? "justify-between" : ""}`}>
        {position === "top" && (
          <div className="flex items-center gap-2 order-1 sm:order-none">
            <span className="text-sm sm:text-lg font-semibold">Waiting for others to join</span>
          </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center @container/controls">
          {position === "top" && role === "Admin" && (
            <div className="flex gap-4">
              {!isRecording ? (
                <Button variant="ghost" className="text-white" onClick={handleStartRecording} disabled={countdown !== null}>Start Recording</Button>
              ) : (
                <Button variant="ghost" className="text-white" onClick={() => { console.log("Stop Recording Clicked"); stopRecording(); }}>Stop Recording</Button>
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
                    onClick={() => { console.log("Toggle Camera Clicked"); toggleCamera(); }}
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
                    onClick={() => { console.log("Toggle Microphone Clicked"); toggleMicrophone(); }}
                    className={`rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${isMicrophoneMuted ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'} text-white transition-all duration-200`}
                  >
                    {isMicrophoneMuted ? <MicOff size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isMicrophoneMuted ? "Unmute Microphone" : "Mute Microphone"}</p>
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
              {!isScreensharing ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      onClick={startScreenshare}
                      className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                    >
                      <MonitorPlay size={20} className="sm:w-6 sm:h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Start Screen Share</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      onClick={stopScreenshare}
                      className="bg-red-600 hover:bg-red-700 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                    >
                      <MonitorPlay size={20} className="sm:w-6 sm:h-6" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop Screen Share</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <SettingsModal>
                <Button
                  variant="secondary"
                  className="bg-gray-700 hover:bg-gray-600 text-white rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 transition-all duration-200"
                >
                  <Settings size={20} className="sm:w-6 sm:h-6" />
                </Button>
              </SettingsModal>
              {role === "Admin" && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="secondary"
                      onClick={isRecording ? stopRecording : handleStartRecording}
                      disabled={countdown !== null}
                      className={`rounded-full p-2 sm:p-3 h-10 w-10 sm:h-12 sm:w-12 @[480px]/controls:h-14 @[480px]/controls:w-14 ${isRecording ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white transition-all duration-200 ${countdown !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Circle
                        size={20}
                        className={`sm:w-6 sm:h-6 ${isRecording ? 'fill-white' : ''}`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isRecording ? "Stop Recording" : "Start Recording"}</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => { console.log("Leave Room Clicked"); leaveRoom(); }}
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
