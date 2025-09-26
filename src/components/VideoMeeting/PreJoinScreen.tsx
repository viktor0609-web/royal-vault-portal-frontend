import React, { useRef, useEffect } from 'react';
import { Button } from "../ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Video, Mic, Volume2, MicOff, VideoOff } from "lucide-react";
import { useDailyMeeting } from "../../context/DailyMeetingContext";

export const PreJoinScreen: React.FC = () => {
  const {
    cameras,
    microphones,
    speakers,
    selectedCamera,
    selectedMicrophone,
    selectedSpeaker,
    localStream,
    isManager,
    setSelectedCamera,
    setSelectedMicrophone,
    setSelectedSpeaker,
    toggleCamera,
    toggleMicrophone,
    joinMeetingAsAdmin,
    joinMeetingAsGuest,
    joinMeetingAsClient,
    isMicrophoneMuted,
    isCameraOff,
    isLoading,
    hasMicPermission,
    hasCamPermission,
    permissionRequested,
    requestPermissions,
    userName,
    setUserName,
    userRole,
  } = useDailyMeeting();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  // Attach localStream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center text-xl bg-gray-800 text-white">Joining...</div>;
  }

  if (!permissionRequested) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Join Meeting</h2>
        <p className="text-center text-gray-700 mb-4">
          Please allow access to your microphone and camera to join the meeting.
        </p>
        <Button onClick={requestPermissions} className="w-[200px] bg-blue-500 hover:bg-blue-600">
          Request Permissions
        </Button>
      </div>
    );
  }

  if (permissionRequested && (!hasMicPermission && !hasCamPermission)) {
    return (
      <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-gray-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Permissions Denied</h2>
        <p className="text-center text-gray-700">
          Microphone and camera access were denied. Please enable them in your browser settings or click the button below to request permissions again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Ready to join?</h2>

      <input
        type="text"
        placeholder="Enter your name"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        className="w-[640px] p-2 border rounded-md text-black mb-4"
      />

      <div className="relative w-[640px] h-[360px] bg-black rounded-lg overflow-hidden mb-4">
        {localStream ? (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">Camera Off</div>
        )}

        <div className="absolute bottom-2 left-2 flex gap-2">
          <Button variant="secondary" size="icon" onClick={toggleMicrophone}>
            {isMicrophoneMuted ? <MicOff /> : <Mic />}
          </Button>
          <Button variant="secondary" size="icon" onClick={toggleCamera}>
            {isCameraOff ? <VideoOff /> : <Video />}
          </Button>
        </div>
      </div>

      <div className="w-[640px] space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="flex-1">
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

        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          <Select value={selectedMicrophone} onValueChange={setSelectedMicrophone}>
            <SelectTrigger className="flex-1">
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

        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
            <SelectTrigger className="flex-1">
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
        onClick={() => {
          console.log('Join button clicked, userRole:', userRole);
          if (userRole === 'admin') {
            joinMeetingAsAdmin();
          } else if (userRole === 'client') {
            joinMeetingAsClient();
          } else {
            joinMeetingAsGuest();
          }
        }}
        className="w-[150px] bg-green-500 hover:bg-green-600"
        disabled={!localStream || !userName}
      >
        Join
      </Button>
    </div>
  );
};
