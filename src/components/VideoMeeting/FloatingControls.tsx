import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Users,
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
import { BottomSheet } from './BottomSheet';

interface FloatingControlsProps {
  togglePeoplePanel: () => void;
  toggleChatBox?: () => void;
  toggleLeftPanel?: () => void;
  toggleSettings?: () => void;
  showChatBox?: boolean;
  showLeftPanel?: boolean;
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
  toggleLeftPanel,
  toggleSettings,
  showChatBox,
  showLeftPanel = false,
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
    raiseHand,
    raisedHands,
    localParticipant,
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
    <Button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary hover:bg-royal-blue-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center p-0"
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3), 0 0 0 0 rgba(59, 130, 246, 0.5)',
      }}
      title={isMenuOpen ? "Close Menu" : "Open Menu"}
    >
      {isMenuOpen ? (
        <X className="h-6 w-6 transition-transform duration-300" />
      ) : (
        <MoreVertical className="h-6 w-6 transition-transform duration-300" />
      )}
    </Button>
  );

  // Control buttons for BottomSheet
  const ControlButtons = (
    <div className="flex flex-col gap-3 p-4">
      {/* Camera Toggle */}
      <Button
        onClick={toggleCamera}
        className={`w-full h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isCameraOff
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
      >
        {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
        <span className="text-base font-medium">
          {isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
        </span>
      </Button>

      {/* Microphone Toggle */}
      <Button
        onClick={toggleMicrophone}
        disabled={!hasAudioPermission}
        className={`w-full h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isMicrophoneMuted
          ? 'bg-red-600 hover:bg-red-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-white'
          } ${!hasAudioPermission ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isMicrophoneMuted ? <MicOff size={20} /> : <Mic size={20} />}
        <span className="text-base font-medium">
          {!hasAudioPermission
            ? (role === "User" ? 'Request Speaking Permission' : 'Audio Permission Required')
            : (isMicrophoneMuted ? 'Unmute Microphone' : 'Mute Microphone')}
        </span>
      </Button>

      {/* Raise Hand - for User */}
      {role === "User" && (
        <Button
          onClick={raiseHand}
          className={`w-full h-14 rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${
            raisedHands.has(localParticipant?.id || '')
              ? 'bg-yellow-600 hover:bg-yellow-700'
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <Hand size={20} />
          <span className="text-base font-medium">
            {raisedHands.has(localParticipant?.id || '') ? "Lower Hand" : "Raise Hand"}
          </span>
        </Button>
      )}

      {/* Participants */}
      <Button
        onClick={() => {
          togglePeoplePanel();
          setIsMenuOpen(false);
        }}
        className="w-full h-14 rounded-lg bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
      >
        <Users size={20} />
        <span className="text-base font-medium">Participants</span>
      </Button>

      {/* Fullscreen Toggle */}
      <Button
        onClick={toggleFullscreen}
        className={`w-full h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isFullscreen
          ? 'bg-blue-600 hover:bg-blue-700 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-white'
          }`}
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        <span className="text-base font-medium">
          {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        </span>
      </Button>

      {/* Screen Share - for Admin and Guest */}
      {(role === "Admin" || role === "Guest") && (
        <Button
          onClick={isScreensharing ? stopScreenshare : startScreenshare}
          className={`w-full h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isScreensharing
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
        >
          <MonitorPlay size={20} />
          <span className="text-base font-medium">
            {isScreensharing ? "Stop Screen Share" : "Start Screen Share"}
          </span>
        </Button>
      )}

      {/* Recording - for Admin */}
      {role === "Admin" && (
        <Button
          onClick={isRecording ? stopRecording : onStartRecordingClick}
          disabled={countdown !== null}
          className={`w-full h-14 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 ${isRecording
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
            } ${countdown !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Circle
            size={20}
            className={isRecording ? 'fill-white' : ''}
          />
          <span className="text-base font-medium">
            {isRecording ? "Stop Recording" : "Start Recording"}
          </span>
        </Button>
      )}

      {/* Settings */}
      <SettingsModal onOpen={() => {
        setIsMenuOpen(false);
        toggleSettings?.();
      }}>
        <Button
          className="w-full h-14 rounded-lg bg-gray-700 hover:bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
          type="button"
        >
          <Settings size={20} />
          <span className="text-base font-medium">Settings</span>
        </Button>
      </SettingsModal>

      {/* Leave Meeting */}
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
        className="w-full h-14 rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
      >
        <LogOut size={20} />
        <span className="text-base font-medium">Leave Meeting</span>
      </Button>
    </div>
  );

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <div className="floating-controls-container">
      {MainFAB}
      <BottomSheet
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        title="Meeting Controls"
        maxHeight="70vh"
      >
        {ControlButtons}
      </BottomSheet>
    </div>
  );
};

