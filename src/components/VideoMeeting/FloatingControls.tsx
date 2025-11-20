import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Users, 
  MessageSquare, 
  MessageSquareX, 
  Settings, 
  LogOut, 
  Maximize, 
  Minimize,
  MonitorPlay,
  Circle,
  MoreVertical,
  X,
  Hand
} from "lucide-react";
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { SettingsModal } from './SettingsModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface FloatingControlsProps {
  togglePeoplePanel: () => void;
  toggleChatBox: () => void;
  showChatBox: boolean;
  toggleFullscreen: () => void;
  isFullscreen: boolean;
  chatUnreadCount?: number;
  role?: string;
  isRecording?: boolean;
  startRecording?: () => void;
  stopRecording?: () => void;
  isScreensharing?: boolean;
  startScreenshare?: () => void;
  stopScreenshare?: () => void;
  onStartRecordingClick?: () => void;
  countdown?: number | null;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  togglePeoplePanel,
  toggleChatBox,
  showChatBox,
  toggleFullscreen,
  isFullscreen,
  chatUnreadCount = 0,
  role,
  isRecording = false,
  startRecording,
  stopRecording,
  isScreensharing = false,
  startScreenshare,
  stopScreenshare,
  onStartRecordingClick,
  countdown = null,
}) => {
  const {
    joined,
    toggleCamera,
    toggleMicrophone,
    isMicrophoneMuted,
    isCameraOff,
    leaveRoom,
    hasLocalAudioPermission,
  } = useDailyMeeting();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Don't close if clicking on the FAB or its children
      if (target.closest('.floating-controls-container')) {
        return;
      }
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  if (!joined || !isMobile) return null;

  const hasAudioPermission = hasLocalAudioPermission;

  // Main FAB button - always visible
  const MainFAB = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-royal-blue-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
            style={{
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.5)',
            }}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 transition-transform duration-300" />
            ) : (
              <MoreVertical className="h-6 w-6 transition-transform duration-300" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
          {isMenuOpen ? "Close Menu" : "Open Menu"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  // Floating action buttons - appear when menu is open
  const FloatingButtons = isMenuOpen && (
    <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-3 items-end">
      {/* Camera Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleCamera}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 ${
                isCameraOff 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              style={{
                animation: isMenuOpen ? 'slideInRight 0.3s ease-out' : 'none',
              }}
            >
              {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Microphone Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleMicrophone}
              disabled={!hasAudioPermission}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 ${
                isMicrophoneMuted 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              } ${!hasAudioPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={{
                animation: isMenuOpen ? 'slideInRight 0.4s ease-out' : 'none',
              }}
            >
              {isMicrophoneMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            {!hasAudioPermission
              ? (role === "User" ? 'Raise your hand to request speaking permission' : 'Audio permission required')
              : (isMicrophoneMuted ? 'Unmute microphone' : 'Mute microphone')}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Raise Hand - for User */}
      {role === "User" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => {
                  // Simple hand button - you can add your own logic here
                  console.log('Hand button clicked');
                }}
                className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
                style={{
                  animation: isMenuOpen ? 'slideInRight 0.5s ease-out' : 'none',
                }}
              >
                <Hand size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
              Raise Hand
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Participants */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={togglePeoplePanel}
              className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
              style={{
                animation: isMenuOpen ? 'slideInRight 0.6s ease-out' : 'none',
              }}
            >
              <Users size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            Participants
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Chat Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleChatBox}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 relative ${
                showChatBox 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              style={{
                animation: isMenuOpen ? 'slideInRight 0.7s ease-out' : 'none',
              }}
            >
              {showChatBox ? <MessageSquareX size={20} /> : <MessageSquare size={20} />}
              {!showChatBox && chatUnreadCount > 0 && (
                <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full min-w-[18px] h-[18px]">
                  {chatUnreadCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            {showChatBox ? "Close Chat" : "Open Chat"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Fullscreen Toggle */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={toggleFullscreen}
              className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 ${
                isFullscreen 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              style={{
                animation: isMenuOpen ? 'slideInRight 0.8s ease-out' : 'none',
              }}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Screen Share - for Admin and Guest */}
      {(role === "Admin" || role === "Guest") && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isScreensharing ? stopScreenshare : startScreenshare}
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 ${
                  isScreensharing 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                }`}
                style={{
                  animation: isMenuOpen ? 'slideInRight 0.9s ease-out' : 'none',
                }}
              >
                <MonitorPlay size={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
              {isScreensharing ? "Stop Screen Share" : "Start Screen Share"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Recording - for Admin */}
      {role === "Admin" && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isRecording ? stopRecording : onStartRecordingClick}
                disabled={countdown !== null}
                className={`h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0 ${
                  isRecording 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                } ${countdown !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  animation: isMenuOpen ? 'slideInRight 1s ease-out' : 'none',
                }}
              >
                <Circle
                  size={20}
                  className={isRecording ? 'fill-white' : ''}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
              {isRecording ? "Stop Recording" : "Start Recording"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Settings */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <SettingsModal>
              <Button
                className="h-12 w-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
                style={{
                  animation: isMenuOpen ? 'slideInRight 1.1s ease-out' : 'none',
                }}
              >
                <Settings size={20} />
              </Button>
            </SettingsModal>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            Settings
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Leave Meeting */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={leaveRoom}
              className="h-12 w-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
              style={{
                animation: isMenuOpen ? 'slideInRight 1.2s ease-out' : 'none',
              }}
            >
              <LogOut size={20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="bg-gray-900 text-white text-sm px-3 py-2 rounded-md">
            Leave Meeting
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );

  return (
    <div className="floating-controls-container">
      {MainFAB}
      {FloatingButtons}
      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

