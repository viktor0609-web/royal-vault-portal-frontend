import React, { useRef, useEffect } from 'react';
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Video, Mic, Volume2, MicOff, VideoOff } from "lucide-react";
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { useAuth } from '../../context/AuthContext';

export const PreJoinScreen: React.FC = () => {
  const {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    localStream,
    role,
    setSelectedCamera,
    setSelectedMicrophone,
    setSelectedSpeaker,
    toggleCamera,
    toggleMicrophone,
    joinMeetingAsAdmin,
    joinMeetingAsGuest,
    isMicrophoneMuted,
    isCameraOff,
    isLoading,
    hasMicPermission,
    hasCamPermission,
    permissionRequested,
    requestPermissions,
    userName,
    setUserName,
  } = useDailyMeeting();

  const { user } = useAuth();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach localStream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (user) {
      setUserName(user.firstName + " " + user.lastName);
    }
  }, [user]);

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center text-xl bg-gray-800 text-white">Joining...</div>;
  }

  if (!permissionRequested) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-1 sm:p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Join Meeting</h2>
        <p className="text-center text-gray-700 mb-4 text-sm sm:text-base px-1 sm:px-4">
          Please allow access to your microphone and camera to join the meeting.
        </p>
        <Button onClick={requestPermissions} className="w-full max-w-[200px] bg-blue-500 hover:bg-blue-600">
          Request Permissions
        </Button>
      </div>
    );
  }

  if (permissionRequested && (!hasMicPermission && !hasCamPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-1 sm:p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-red-600 text-center">Permissions Denied</h2>
        <p className="text-center text-gray-700 text-sm sm:text-base px-1 sm:px-4">
          Microphone and camera access were denied. Please enable them in your browser settings or click the button below to request permissions again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-1 sm:p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Ready to join?</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-full max-w-sm sm:max-w-md p-2 sm:p-3 border rounded-md text-black mb-4 text-sm sm:text-base"
      />

      <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-lg aspect-video bg-black rounded-lg overflow-hidden mb-4">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-sm sm:text-base">Camera Off</div>
        )}

        <div className="absolute bottom-2 left-2 flex gap-1 sm:gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleMicrophone}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            {isMicrophoneMuted ? <MicOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Mic className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleCamera}
            className="h-8 w-8 sm:h-10 sm:w-10"
          >
            {isCameraOff ? <VideoOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Video className="h-3 w-3 sm:h-4 sm:w-4" />}
          </Button>
        </div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-2 sm:space-y-4 mb-4 sm:mb-1">
        <div className="flex  sm:flex-row items-start items-center gap-2">
          <Video className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-1 sm:mt-0" />
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-full text-sm sm:text-base">
              <SelectValue placeholder="Select a camera" />
            </SelectTrigger>
            <SelectContent>
              {cameras.filter(device => device.deviceId !== '').map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex sm:flex-row items-start items-center gap-2">
          <Mic className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-1 sm:mt-0" />
          <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
            <SelectTrigger className="w-full text-sm sm:text-base">
              <SelectValue placeholder="Select a microphone" />
            </SelectTrigger>
            <SelectContent>
              {microphones.filter(device => device.deviceId !== '').map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex sm:flex-row items-start items-center gap-2">
          <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-1 sm:mt-0" />
          <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
            <SelectTrigger className="w-full text-sm sm:text-base">
              <SelectValue placeholder="Select a speaker" />
            </SelectTrigger>
            <SelectContent>
              {speakers.filter(device => device.deviceId !== '').map(device => (
                <SelectItem key={device.deviceId} value={device.deviceId}>
                  {device.label || `Speaker ${device.deviceId}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        onClick={() => role === "Admin" ? joinMeetingAsAdmin() : joinMeetingAsGuest()}
        className="w-full max-w-[150px] sm:max-w-[200px] bg-green-500 hover:bg-green-600 text-sm sm:text-base mt-0 sm:mt-3"
        disabled={!localStream || !userName}
      >
        Join
      </Button>
    </div>
  );
};
