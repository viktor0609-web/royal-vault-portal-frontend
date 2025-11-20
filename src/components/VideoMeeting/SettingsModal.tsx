import React, { useState, useEffect } from 'react';
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { Settings, Video, VideoOff, Mic, MicOff, Volume2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface SettingsModalProps {
  children: React.ReactNode;
  onOpen?: () => void;
}

// Settings content component (reusable for both Dialog and BottomSheet)
export const SettingsContent = () => {
  const {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    switchCamera,
    switchMicrophone,
    switchSpeaker,
    toggleCamera,
    toggleMicrophone,
    isMicrophoneMuted,
    isCameraOff,
    backgroundFilterType,
    setBackgroundFilter,
    backgroundImages,
    selectedBackgroundImage,
  } = useDailyMeeting();

  return (
    <div className="space-y-6 py-4">
      {/* Camera Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isCameraOff ? (
              <VideoOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Video className="h-5 w-5 text-green-500" />
            )}
            <Label className="text-base font-semibold text-white">Camera</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="camera-toggle" className="text-sm text-gray-300">
              {isCameraOff ? "Off" : "On"}
            </Label>
            <Switch
              id="camera-toggle"
              checked={!isCameraOff}
              onCheckedChange={() => toggleCamera()}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-400">Select Camera</Label>
          <Select value={selectedCamera} onValueChange={switchCamera}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a camera" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 !z-[70]">
              {cameras.filter(device => device.deviceId !== '').map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId}
                  className="text-white focus:bg-gray-700"
                >
                  {device.label || `Camera ${device.deviceId.substring(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Microphone Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isMicrophoneMuted ? (
              <MicOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Mic className="h-5 w-5 text-green-500" />
            )}
            <Label className="text-base font-semibold text-white">Microphone</Label>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="mic-toggle" className="text-sm text-gray-300">
              {isMicrophoneMuted ? "Muted" : "Unmuted"}
            </Label>
            <Switch
              id="mic-toggle"
              checked={!isMicrophoneMuted}
              onCheckedChange={() => toggleMicrophone()}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-400">Select Microphone</Label>
          <Select value={selectedMicrophone} onValueChange={switchMicrophone}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a microphone" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 !z-[70]">
              {microphones.filter(device => device.deviceId !== '').map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId}
                  className="text-white focus:bg-gray-700"
                >
                  {device.label || `Microphone ${device.deviceId.substring(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Speaker Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-gray-400" />
          <Label className="text-base font-semibold text-white">Speaker</Label>
        </div>
        <div className="space-y-2">
          <Label className="text-sm text-gray-400">Select Speaker</Label>
          <Select value={selectedSpeaker} onValueChange={switchSpeaker}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select a speaker" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 !z-[70]">
              {speakers.filter(device => device.deviceId !== '').map((device) => (
                <SelectItem
                  key={device.deviceId}
                  value={device.deviceId}
                  className="text-white focus:bg-gray-700"
                >
                  {device.label || `Speaker ${device.deviceId.substring(0, 8)}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border-t border-gray-700"></div>

      {/* Background Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <Label className="text-base font-semibold text-white">Background</Label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Button
            onClick={() => setBackgroundFilter('none')}
            className={cn(
              "w-full h-20 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 border-2",
              backgroundFilterType === 'none' ? "border-blue-500 bg-blue-900/20" : "border-gray-700"
            )}
          >
            <span className="text-xs mt-1">None</span>
          </Button>
          <Button
            onClick={() => setBackgroundFilter('blur')}
            className={cn(
              "w-full h-20 flex flex-col items-center justify-center bg-gray-800 hover:bg-gray-700 border-2",
              backgroundFilterType === 'blur' ? "border-blue-500 bg-blue-900/20" : "border-gray-700"
            )}
          >
            <span className="text-xs mt-1">Blur</span>
          </Button>
          {backgroundImages.map((image, index) => (
            <div
              key={index}
              className={cn(
                "relative w-full h-20 cursor-pointer rounded-md border-2 overflow-hidden",
                selectedBackgroundImage === image ? "border-blue-500" : "border-gray-700"
              )}
              onClick={() => setBackgroundFilter('image', image)}
            >
              <img
                src={image}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedBackgroundImage === image && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-500 bg-opacity-50">
                  <span className="text-xs font-bold text-white">Selected</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = ({ children, onOpen }) => {
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

  // Mobile: Just trigger the callback
  if (isMobile) {
    const handleClick = (e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      onOpen?.();
    };

    return (
      <>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
              handleClick(e);
            }
          } as any)
          : (
            <div
              onClick={handleClick}
              className="w-full"
            >
              {children}
            </div>
          )}
      </>
    );
  }

  // Desktop: Use Dialog (uncontrolled - Dialog manages its own state)
  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild onClick={() => onOpen?.()}>
            {children}
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Settings</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 text-white border-gray-700 max-h-[90vh] overflow-y-auto [&>button]:block sm:[&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>
        <SettingsContent />
      </DialogContent>
    </Dialog>
  );
};
