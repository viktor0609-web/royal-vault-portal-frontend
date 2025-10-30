import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import DailyIframe, { DailyCall, DailyParticipant } from '@daily-co/daily-js';

type BackgroundFilterType = 'none' | 'blur' | 'image';

interface DailyMeetingContextType {
  roomUrl: string;
  joined: boolean;
  dailyRoom: DailyCall | null;
  participants: any[];
  setRoomUrl: (url: string) => void;
  joinRoom: () => void;
  leaveRoom: () => void;
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  ejectParticipant: (sessionId: string) => Promise<void>;
  toggleParticipantAudio: (sessionId: string) => Promise<void>;
  toggleParticipantAudioPermission: (sessionId: string) => Promise<void>;
  isPermissionModalOpen: boolean;
  hasMicPermission: boolean;
  hasCamPermission: boolean;
  isLoading: boolean;
  requestPermissions: () => Promise<void>;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  selectedCamera: string;
  selectedMicrophone: string;
  selectedSpeaker: string;
  localStream: MediaStream | null;
  setSelectedCamera: (deviceId: string) => void;
  setSelectedMicrophone: (deviceId: string) => void;
  setSelectedSpeaker: (deviceId: string) => void;
  startLocalPreview: () => Promise<void>;
  stopLocalPreview: () => void;
  toggleCamera: () => void;
  toggleMicrophone: () => void;
  joinMeetingAsAdmin: () => Promise<void>;
  joinMeetingAsGuest: () => Promise<void>;
  isMicrophoneMuted: boolean;
  isCameraOff: boolean;
  permissionRequested: boolean;
  setPermissionRequested: (requested: boolean) => void;
  isScreensharing: boolean;
  screenshareParticipantId: string | null;
  startScreenshare: () => Promise<void>;
  stopScreenshare: () => Promise<void>;
  backgroundFilterType: BackgroundFilterType;
  setBackgroundFilter: (type: BackgroundFilterType, imageUrl?: string) => Promise<void>;
  backgroundImages: string[];
  selectedBackgroundImage: string | undefined;
  userName: string; // Add userName to context type
  setUserName: (name: string) => void; // Add setUserName to context type
  setRole: (value: RoleType) => void;
  localParticipant: any; // Add localParticipant to context type
  hasLocalAudioPermission: boolean; // Add hasLocalAudioPermission
  role: RoleType;
}

const DailyMeetingContext = createContext<DailyMeetingContextType | undefined>(undefined);

export type RoleType = "User" | "Guest" | "Admin";

export const DailyMeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roomUrl, setRoomUrl] = useState<string>(import.meta.env.VITE_DAILY_ROOM_URL || '');
  const [roomName, setRoomName] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [dailyRoom, setDailyRoom] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [role, setRole] = useState<RoleType>("User"); // replace with real logic
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(false);
  const [hasCamPermission, setHasCamPermission] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState<boolean>(true);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(true);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  const [isScreensharing, setIsScreensharing] = useState<boolean>(false);
  const [screenshareParticipantId, setScreenshareParticipantId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(""); // New state for user name
  const [localParticipant, setLocalParticipant] = useState<any>(null); // State for local participant
  const [hasLocalAudioPermission, setHasLocalAudioPermission] = useState<boolean>(false);


  const [backgroundFilterType, setBackgroundFilterType] = useState<BackgroundFilterType>('none');
  const [selectedBackgroundImage, setSelectedBackgroundImage] = useState<string | undefined>(undefined);

  // Predefined background images (relative paths OK — code resolves to absolute)
  const backgroundImages = [
    '/imgs/background1.jpg',
    '/imgs/background2.jpg',
    '/imgs/background3.jpg',
    '/imgs/background4.jpg',
  ];

  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [speakers, setSpeakers] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  /* ---------- Helpers ---------- */

  // Convert relative paths to full absolute URL; allow data:, http(s): and blob: through
  const resolveImageSource = (url?: string) => {
    if (!url) return undefined;
    if (/^(data:|https?:|blob:)/i.test(url)) return url;
    try {
      // Build absolute URL based on current location
      return new URL(url, window.location.href).href;
    } catch {
      return url;
    }
  };

  /* ---------- Room management ---------- */

  const getAdminToken = async (roomName: string) => {
    const response = await fetch("https://api.daily.co/v1/meeting-tokens", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_DAILY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          is_owner: true, // ✅ makes this token an admin
        },
      }),
    });

    const data = await response.json();
    return data.token; // ✅ admin token
  };

  const startLocalPreview = useCallback(async () => {
    if (localStream) stopLocalPreview();
    setPermissionRequested(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true,
        audio: selectedMicrophone ? { deviceId: { exact: selectedMicrophone } } : true,
      });
      setLocalStream(stream);
      setHasCamPermission(true);
      setHasMicPermission(true);
      setIsMicrophoneMuted(true);
      setIsCameraOff(false);
    } catch (error) {
      console.error('Error starting local preview:', error);
      if (error instanceof DOMException && error.name === 'NotReadableError') {
        console.error('NotReadableError: device in use or inaccessible.');
      }
      setHasCamPermission(false);
      setHasMicPermission(false);
      setLocalStream(null);
    }
  }, [localStream, selectedCamera, selectedMicrophone]);

  const stopLocalPreview = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
  }, [localStream]);

  const joinRoom = useCallback(() => {
    if (!roomUrl) {
      alert('Please create a room first.');
      return;
    }
    // Show pre-join UI / preview:
    startLocalPreview();
    setIsPermissionModalOpen(true);
  }, [roomUrl, startLocalPreview]);

  const joinMeetingAsAdmin = async () => {
    console.log("join as admin");
    setIsLoading(true);
    // stop preview to avoid duplicate tracks when joining
    stopLocalPreview();

    try {
      let currentDailyRoom = dailyRoom;

      // CRITICAL FIX: Destroy any existing Daily call object to prevent duplicates
      if (currentDailyRoom) {
        try {
          console.log("Destroying existing Daily call object before creating new one");
          await currentDailyRoom.destroy();
          currentDailyRoom = null;
          setDailyRoom(null);
        } catch (err) {
          console.warn("Error destroying existing call object:", err);
        }
      }

      // Create new call object
      currentDailyRoom = DailyIframe.createCallObject({
        url: roomUrl,
        userName: userName + ' (' + role + ')' || 'undefined (' + role + ')', // Pass userName here
        // pass device IDs as sources if selected
        videoSource: selectedCamera || undefined,
        audioSource: selectedMicrophone || undefined,
      });
      setDailyRoom(currentDailyRoom);

      const token = await getAdminToken(roomName);
      // join the call
      await currentDailyRoom.join({
        token,
        startVideoOff: isCameraOff,
        startAudioOff: isMicrophoneMuted,
      });

      setJoined(true);
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error('Error joining Daily.co room:', error);
      // re-start preview if join fails
      startLocalPreview();
    } finally {
      setIsLoading(false);
    }
  };
  const joinMeetingAsGuest = async () => {
    console.log("join as user/guest");
    setIsLoading(true);
    // stop preview to avoid duplicate tracks when joining
    stopLocalPreview();
    try {
      let currentDailyRoom = dailyRoom;

      // CRITICAL FIX: Destroy any existing Daily call object to prevent duplicates
      if (currentDailyRoom) {
        try {
          console.log("Destroying existing Daily call object before creating new one");
          await currentDailyRoom.destroy();
          currentDailyRoom = null;
          setDailyRoom(null);
        } catch (err) {
          console.warn("Error destroying existing call object:", err);
        }
      }

      // Create new call object
      currentDailyRoom = DailyIframe.createCallObject({
        url: roomUrl,
        userName: userName + " (" + role + ")" || 'undefined (' + role + ')', // Pass userName here
        // pass device IDs as sources if selected
        videoSource: selectedCamera || undefined,
        audioSource: selectedMicrophone || undefined,
      });
      setDailyRoom(currentDailyRoom);

      // join the call
      await currentDailyRoom.join({
        startVideoOff: isCameraOff,
        startAudioOff: isMicrophoneMuted,
      });

      setJoined(true);
      setIsPermissionModalOpen(false);
    } catch (error) {
      console.error('Error joining Daily.co room:', error);
      // re-start preview if join fails
      startLocalPreview();
    } finally {
      setIsLoading(false);
    }
  };
  const leaveRoom = () => {
    if (dailyRoom) {
      try {
        console.log("Leaving and destroying Daily call object");
        dailyRoom.leave();
        dailyRoom.destroy();
      } catch (err) {
        console.warn("Error during leaveRoom:", err);
      } finally {
        setJoined(false);
        setDailyRoom(null);
        setParticipants([]);
        stopLocalPreview();
      }
    }
  };

  /* ---------- Devices / preview ---------- */

  const requestPermissions = async () => {
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      mic.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setHasMicPermission(false);
    }

    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamPermission(true);
      cam.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasCamPermission(false);
    }
  };

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vids = devices.filter((d) => d.kind === 'videoinput');
      const mics = devices.filter((d) => d.kind === 'audioinput');
      const outs = devices.filter((d) => d.kind === 'audiooutput');

      setCameras(vids);
      setMicrophones(mics);
      setSpeakers(outs);

      if (vids.length > 0 && !selectedCamera) {
        setSelectedCamera(vids[0].deviceId);
      }
      if (mics.length > 0 && !selectedMicrophone) {
        setSelectedMicrophone(mics[0].deviceId);
      }
      if (outs.length > 0 && !selectedSpeaker) {
        setSelectedSpeaker(outs[0].deviceId);
      }
    } catch (err) {
      console.error('Error enumerating devices:', err);
    }
  };

  /* ---------- Meeting / participants ---------- */

  useEffect(() => {
    enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', enumerateDevices);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', enumerateDevices);
      stopLocalPreview();

      // Cleanup: Destroy Daily call object when provider unmounts
      if (dailyRoom) {
        try {
          console.log("Provider unmounting - destroying Daily call object");
          dailyRoom.destroy();
        } catch (err) {
          console.warn("Error destroying Daily call object on unmount:", err);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!dailyRoom) return;

    const updateParticipants = async () => {
      console.log("updateParticipants called");

      try {
        const pObj = dailyRoom.participants();
        const pList = Object.values(pObj).map((participant: DailyParticipant) => ({
          id: participant.session_id,
          name: participant.user_name,
          local: participant.local,
          videoTrack: participant.tracks?.video?.persistentTrack,
          audioTrack: participant.tracks?.audio?.persistentTrack,
          screenVideoTrack: participant.tracks?.screenVideo?.persistentTrack,
          permissions: participant.permissions,
          // Add Daily.co participant properties for audio/video state
          audio: participant.audio,
          video: participant.video,
        }));
        setParticipants(pList);

        const local = pList.find(p => p.local);
        setLocalParticipant(local);
        if (local) {
          // Update hasLocalAudioPermission based on participant permissions
          const canSend = local.permissions?.canSend === true;
          setHasLocalAudioPermission(canSend);

          // If user doesn't have audio permission, ensure they're muted
          if (!canSend && !isMicrophoneMuted) {
            dailyRoom.setLocalAudio(false);
            setIsMicrophoneMuted(true);
          }
        }


        const screenshare = Object.values(pObj).find((part: any) => part?.tracks?.screenVideo?.persistentTrack);
        if (screenshare) {
          setIsScreensharing(true);
          setScreenshareParticipantId(screenshare.session_id);
        } else {
          setIsScreensharing(false);
          setScreenshareParticipantId(null);
        }
      } catch (err) {
        console.error('Error getting participants:', err);
      }
    };

    dailyRoom.on('joined-meeting', updateParticipants);
    dailyRoom.on('participant-joined', updateParticipants);
    dailyRoom.on('participant-updated', updateParticipants);
    dailyRoom.on('participant-left', updateParticipants);
    dailyRoom.on('track-started', updateParticipants);
    dailyRoom.on('track-stopped', updateParticipants);

    // initial update
    updateParticipants();

    const handleAppMessage = (e: any) => {
      if (e.data.type === 'ejected') { // Handle ejected message
        console.log('You have been ejected from the room.');
        leaveRoom(); // Ejected participant leaves the room

        setTimeout(() => alert('You have been ejected from the meeting by the admin.'), 1000);
      }
    };
    dailyRoom.on('app-message', handleAppMessage);

    // Recording event listeners
    const handleRecordingStarted = () => {
      console.log('Recording started');
      setIsRecording(true);
    };
    const handleRecordingStopped = () => {
      console.log('Recording stopped');
      setIsRecording(false);
    };
    const handleRecordingError = (e: any) => {
      console.error('Recording error:', e);
      setIsRecording(false);
    };
    dailyRoom.on('recording-started', handleRecordingStarted);
    dailyRoom.on('recording-stopped', handleRecordingStopped);
    dailyRoom.on('recording-error', handleRecordingError);

    return () => {
      try {
        dailyRoom.off('joined-meeting', updateParticipants);
        dailyRoom.off('participant-joined', updateParticipants);
        dailyRoom.off('participant-updated', updateParticipants);
        dailyRoom.off('participant-left', updateParticipants);
        dailyRoom.off('track-started', updateParticipants);
        dailyRoom.off('track-stopped', updateParticipants);
        dailyRoom.off('app-message', handleAppMessage);
        dailyRoom.off('recording-started', handleRecordingStarted);
        dailyRoom.off('recording-stopped', handleRecordingStopped);
        dailyRoom.off('recording-error', handleRecordingError);
      } catch (e) {
        console.warn("Error removing event listeners:", e);
      }

      // Note: We don't destroy here because it's handled by leaveRoom()
      // and the join functions. This prevents double-destroy errors.
    };
  }, [dailyRoom]);

  /* ---------- Controls (recording / screenshare / participants) ---------- */

  const startRecording = async () => {
    if (!dailyRoom) return;
    try {
      await dailyRoom.startRecording({
        type: "cloud",
        layout: {
          preset: "custom",
          composition_id: "daily:baseline",
          composition_params: {
            mode: "dominant",
            'videoSettings.dominant.position': 'left',
            'videoSettings.dominant.splitPos': 0.8,
            'videoSettings.dominant.numChiclets': 5,
            'videoSettings.dominant.followDomFlag': false,
            'videoSettings.dominant.itemInterval_gu': 0.7,
            'videoSettings.dominant.outerPadding_gu': 0.5,
            'videoSettings.dominant.splitMargin_gu': 0,
            'videoSettings.preferScreenshare': true,
            'videoSettings.preferredParticipantIds': participants.find((p: any) => p.role === 'Guest')?.session_id,
            'videoSettings.dominant.sharpCornersOnMain': true,
            'videoSettings.showParticipantLabels': true,
            'videoSettings.labels.fontFamily': 'Roboto',
            'videoSettings.labels.fontWeight': '600',
            'videoSettings.labels.fontSize_pct': 100,
            'videoSettings.labels.offset_x_gu': 0,
            'videoSettings.labels.offset_y_gu': 0,
            'videoSettings.labels.color': 'white',
            'videoSettings.labels.strokeColor': 'rgba(0, 0, 0, 0.9)',
          },
          // participants: {
          //   video: participants.filter((p: any) => p.role === 'Guest' || p.role === 'Admin').map((p: any) => p.session_id),
          //   audio: ["*"],
          //   sort: "active",
          // },
        },
      });


      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = async () => {
    if (!dailyRoom) return;
    try {
      await dailyRoom.stopRecording();
      setIsRecording(false);
    } catch (err) {
      console.error('Error stopping recording:', err);
    }
  };

  const ejectParticipant = async (sessionId: string) => {
    if (!dailyRoom) return;
    try {
      //  await dailyRoom.updateParticipant(sessionId, { eject: true });
      dailyRoom.sendAppMessage({ type: 'ejected' }, sessionId); // Send app message to ejected participant
    } catch (err) {
      console.error('Error ejecting participant:', err);
    }
  };

  const toggleParticipantAudio = async (sessionId: string) => {
    if (!dailyRoom || !joined) return;
    try {
      const pObj = await dailyRoom.participants();
      const participant = pObj[sessionId];
      if (!participant) return;
      const newAudioState = !participant?.audio;
      await dailyRoom.updateParticipant(sessionId, { setAudio: newAudioState });
      console.log(`Participant ${sessionId}  audio toggled to ${newAudioState}`);
    } catch (err) {
      console.error('Error toggling participant audio:', err);
    }
  };

  const toggleParticipantAudioPermission = async (sessionId: string) => {
    if (!dailyRoom || !joined) return;
    try {
      const pObj = await dailyRoom.participants();
      const participant = pObj[sessionId];
      if (!participant) return;

      const currentCanSend = participant.permissions?.canSend

      await dailyRoom.updateParticipant(sessionId, { updatePermissions: { canSend: !currentCanSend } });

      // Update hasLocalAudioPermission for the local user if this is their permission being changed
      if (participant.local) {
        setHasLocalAudioPermission(!currentCanSend);
      }

      // Force a participant update to reflect the new permissions immediately
      const updatedParticipants = await dailyRoom.participants();
      setParticipants(Object.values(updatedParticipants).map((p: any) => ({
        id: p.session_id,
        name: p.user_name,
        local: p.local,
        videoTrack: p.tracks?.video?.persistentTrack,
        audioTrack: p.tracks?.audio?.persistentTrack,
        screenVideoTrack: p.tracks?.screenVideo?.persistentTrack,
        permissions: p.permissions, // Ensure permissions are also captured
      })));

    } catch (err) {
      console.error('Error toggling participant audio permission:', err);
    }
  };



  const startScreenshare = async () => {
    if (!dailyRoom || !joined) return;
    try {

      await dailyRoom.startScreenShare();

    } catch (err) {
      console.error('Error starting screenshare:', err);
    }
  };

  const stopScreenshare = async () => {
    if (!dailyRoom || !joined) return;
    try {
      await dailyRoom.stopScreenShare();
      setIsScreensharing(false);
    } catch (err) {
      console.error('Error stopping screenshare:', err);
    }
  };

  /* ---------- Camera / mic toggles ---------- */

  const toggleCamera = () => {
    const willTurnOn = isCameraOff; // if currently off, we want to turn ON

    // Check if dailyRoom exists and is not destroyed
    if (dailyRoom && joined) {
      try {
        dailyRoom.setLocalVideo(willTurnOn);
      } catch (e) {
        console.warn('setLocalVideo error', e);
        // If the room is destroyed, don't update the state
        if (e.message && e.message.includes('destroy')) {
          return;
        }
      }
    }

    // Always update local stream and state for preview functionality
    if (localStream) {
      localStream.getVideoTracks().forEach((t) => (t.enabled = willTurnOn));
    }
    setIsCameraOff(!willTurnOn);
  };

  const toggleMicrophone = () => {
    const willTurnOn = isMicrophoneMuted; // if currently muted, we want to turn ON

    // Check if dailyRoom exists and is not destroyed
    if (dailyRoom && joined) {
      try {
        dailyRoom.setLocalAudio(willTurnOn);
      } catch (e) {
        console.warn('setLocalAudio error', e);
        // If the room is destroyed, don't update the state
        if (e.message && e.message.includes('destroy')) {
          return;
        }
      }
    }

    // Always update local stream and state for preview functionality
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => (t.enabled = willTurnOn));
    }
    setIsMicrophoneMuted(!willTurnOn);
  };

  /* ---------- Background filter (fix applied here) ---------- */

  const setBackgroundFilter = async (type: BackgroundFilterType, imageUrl?: string) => {
    if (!dailyRoom) {
      console.warn('No Daily call instance available to set background.');
      return;
    }

    // check if browser supports video processing (blur / image)
    const supported = DailyIframe && typeof (DailyIframe as any).supportedBrowser === 'function'
      ? (DailyIframe as any).supportedBrowser()
      : null;

    if ((type === 'blur' || type === 'image') && !supported?.supportsVideoProcessing) {
      alert('Your browser does not support virtual backgrounds (video processing). Try Chrome/Edge/Firefox on desktop.');
      return;
    }

    // ensure we have a camera stream started (processor needs a running video input)
    if (!localStream) {
      try {
        await startLocalPreview();
      } catch {
        // ignore — startLocalPreview already logs errors
      }
    }

    try {
      let processor: any = { type: 'none' };

      if (type === 'blur') {
        processor = { type: 'background-blur', config: { strength: 1 } };
      } else if (type === 'image') {
        if (!imageUrl) {
          console.warn('setBackgroundFilter: image type requested but no imageUrl provided.');
          return;
        }
        const source = resolveImageSource(imageUrl);
        // Basic check for allowed extension (docs allow .jpg .jpeg .png) — we warn but still try
        const ext = (source || '').split('.').pop()?.toLowerCase();
        if (!ext || !['jpg', 'jpeg', 'png'].includes(ext)) {
          console.warn('Background image may be unsupported by Daily (supported: .jpg, .jpeg, .png).', source);
        }

        processor = {
          type: 'background-image',
          config: {
            source,
          },
        };
      } else {
        processor = { type: 'none' };
      }

      // IMPORTANT: dailyRoom.updateInputSettings expects the video object under top-level video
      // (docs/examples use dailyRoom.updateInputSettings({ video: { processor: {...} } }))
      await dailyRoom.updateInputSettings({
        video: {
          processor,
        },
      } as any);

      setBackgroundFilterType(type);
      setSelectedBackgroundImage(type === 'image' ? imageUrl : undefined);
      console.log(`Background filter set: ${type}${imageUrl ? ' ' + imageUrl : ''}`);
    } catch (err) {
      console.error('Error setting background filter:', err);
    }
  };

  /* ---------- Return context ---------- */

  return (
    <DailyMeetingContext.Provider
      value={{
        roomUrl,
        joined,
        dailyRoom,
        participants,
        role,
        setRole,
        setRoomUrl,
        joinRoom,
        leaveRoom,
        isRecording,
        startRecording,
        stopRecording,
        ejectParticipant,
        toggleParticipantAudio,
        isPermissionModalOpen,
        hasMicPermission,
        hasCamPermission,
        isLoading,
        requestPermissions,
        cameras,
        microphones,
        speakers,
        selectedCamera,
        selectedMicrophone,
        selectedSpeaker,
        localStream,
        setSelectedCamera,
        setSelectedMicrophone,
        setSelectedSpeaker,
        startLocalPreview,
        stopLocalPreview,
        toggleCamera,
        toggleMicrophone,
        joinMeetingAsAdmin,
        joinMeetingAsGuest,
        isMicrophoneMuted,
        isCameraOff,
        permissionRequested,
        setPermissionRequested,
        isScreensharing,
        screenshareParticipantId,
        startScreenshare,
        stopScreenshare,
        backgroundFilterType,
        setBackgroundFilter,
        backgroundImages,
        selectedBackgroundImage,
        toggleParticipantAudioPermission,
        userName,
        setUserName,
        localParticipant, // Provide localParticipant
        hasLocalAudioPermission, // Provide hasLocalAudioPermission
      }}
    >
      {children}
    </DailyMeetingContext.Provider>
  );
};

export const useDailyMeeting = () => {
  const context = useContext(DailyMeetingContext);
  if (context === undefined) {
    throw new Error('useDailyMeeting must be used within a DailyMeetingProvider');
  }
  return context;
};
