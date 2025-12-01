import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import DailyIframe, { DailyCall, DailyParticipant, DailyParticipantPermissions } from '@daily-co/daily-js';
import type { WebinarStatus } from '@/types';

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
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchSpeaker: (deviceId: string) => Promise<void>;
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
  sendWebinarStatusChange: (status: string) => Promise<void>;
  webinarStatus: string;
  setWebinarStatus: (status: WebinarStatus) => void;
}

const DailyMeetingContext = createContext<DailyMeetingContextType | undefined>(undefined);

export type RoleType = "User" | "Guest" | "Admin";

export type ParticipantType = {
  id: string;
  name: string;
  local: boolean;
  videoTrack: MediaStreamTrack;
  audioTrack: MediaStreamTrack;
  screenVideoTrack: MediaStreamTrack;
  permissions: DailyParticipantPermissions;
  audio: boolean;
  video: boolean;
  speaking: boolean;
}

export const DailyMeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roomUrl, setRoomUrl] = useState<string>(import.meta.env.VITE_DAILY_ROOM_URL || '');
  const [roomName, setRoomName] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [dailyRoom, setDailyRoom] = useState<DailyCall | null>(null);
  const [participants, setParticipants] = useState<ParticipantType[]>([]);
  const [speakingParticipants, setSpeakingParticipants] = useState<Set<string>>(new Set());
  const [role, setRole] = useState<RoleType>("User"); // replace with real logic
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean>(true);
  const [hasCamPermission, setHasCamPermission] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMicrophoneMuted, setIsMicrophoneMuted] = useState<boolean>(true);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(true);
  const [permissionRequested, setPermissionRequested] = useState<boolean>(false);
  const [isScreensharing, setIsScreensharing] = useState<boolean>(false);
  const [screenshareParticipantId, setScreenshareParticipantId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>(""); // New state for user name
  const [localParticipant, setLocalParticipant] = useState<any>(null); // State for local participant
  const [hasLocalAudioPermission, setHasLocalAudioPermission] = useState<boolean>(false);
  const [webinarStatus, setWebinarStatus] = useState<WebinarStatus>("Scheduled");


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

      // Re-enumerate devices after permissions are granted to get proper device IDs and labels
      // This is important because before permissions are granted, device labels are empty
      await enumerateDevices();
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
      console.warn('Please create a room first.');
      // TODO: Show toast notification in the component using this context
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
    setPermissionRequested(true);

    let micGranted = false;
    let camGranted = false;

    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      micGranted = true;
      mic.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error('Microphone permission denied:', err);
      setHasMicPermission(false);
    }

    try {
      const cam = await navigator.mediaDevices.getUserMedia({ video: true });
      setHasCamPermission(true);
      camGranted = true;
      cam.getTracks().forEach((t) => t.stop());
    } catch (err) {
      console.error('Camera permission denied:', err);
      setHasCamPermission(false);
    }

    // Re-enumerate devices after permissions are granted to get proper device IDs and labels
    // This is important because before permissions are granted, device labels are empty
    if (micGranted || camGranted) {
      await enumerateDevices();
    }
  };

  const enumerateDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      // Filter out devices with empty deviceId (these appear before permissions are granted)
      const vids = devices.filter((d) => d.kind === 'videoinput' && d.deviceId !== '');
      const mics = devices.filter((d) => d.kind === 'audioinput' && d.deviceId !== '');
      const outs = devices.filter((d) => d.kind === 'audiooutput' && d.deviceId !== '');

      console.log("vids:", vids);
      console.log("mics:", mics);
      console.log("outs:", outs);

      setCameras(vids);
      setMicrophones(mics);
      setSpeakers(outs);

      // Always set default devices if not set, or if current selection is invalid
      if (vids.length > 0) {
        const currentCameraValid = selectedCamera && vids.some(v => v.deviceId === selectedCamera);
        if (!currentCameraValid) {
          setSelectedCamera(vids[0].deviceId);
        }
      }

      if (mics.length > 0) {
        const currentMicValid = selectedMicrophone && mics.some(m => m.deviceId === selectedMicrophone);
        if (!currentMicValid) {
          setSelectedMicrophone(mics[0].deviceId);
        }
      }

      if (outs.length > 0) {
        const currentSpeakerValid = selectedSpeaker && outs.some(o => o.deviceId === selectedSpeaker);
        if (!currentSpeakerValid) {
          setSelectedSpeaker(outs[0].deviceId);
        }
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
        const pList = Object.values(pObj).map((participant: DailyParticipant) => {
          const sessionId = participant.session_id;
          // Mark as speaking if in speaking set, or if audio is active (for users)
          const isUser = !participant.permissions?.canAdmin && !participant.user_name?.includes("Guest");
          const hasAudioTrack = !!(participant.tracks?.audio?.persistentTrack);
          const isSpeaking = speakingParticipants.has(sessionId) ||
            (isUser && participant.audio && hasAudioTrack);

          return {
            id: sessionId,
            name: participant.user_name,
            local: participant.local,
            videoTrack: participant.tracks?.video?.persistentTrack,
            audioTrack: participant.tracks?.audio?.persistentTrack,
            screenVideoTrack: participant.tracks?.screenVideo?.persistentTrack,
            permissions: participant.permissions,
            // Add Daily.co participant properties for audio/video state
            audio: participant.audio,
            video: participant.video,
            speaking: !!isSpeaking, // Ensure boolean
          };
        });
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

    dailyRoom.on('joined-meeting', () => {
      updateParticipants();
      // Enumerate devices when meeting is joined to ensure we have the latest device list
      enumerateDevices();
    });
    dailyRoom.on('participant-joined', updateParticipants);
    dailyRoom.on('participant-updated', (e: any) => {
      // When participant is updated, check if they're speaking (audio active)
      if (e.participant) {
        const isUser = !e.participant.permissions?.canAdmin && !e.participant.user_name?.includes("Guest");
        if (isUser && e.participant.audio && e.participant.tracks?.audio?.persistentTrack) {
          setSpeakingParticipants(prev => new Set(prev).add(e.participant.session_id));
        } else if (isUser && (!e.participant.audio || !e.participant.tracks?.audio?.persistentTrack)) {
          // Remove after a delay to allow for natural speech pauses
          setTimeout(() => {
            setSpeakingParticipants(prev => {
              const next = new Set(prev);
              next.delete(e.participant.session_id);
              return next;
            });
            updateParticipants();
          }, 2000); // 2 second delay before removing
        }
      }
      updateParticipants();
    });
    dailyRoom.on('participant-left', (e: any) => {
      // Remove from speaking set when participant leaves
      setSpeakingParticipants(prev => {
        const next = new Set(prev);
        next.delete(e.participant.session_id);
        return next;
      });
      updateParticipants();
    });
    dailyRoom.on('track-started', updateParticipants);
    dailyRoom.on('track-stopped', updateParticipants);

    // Track speaking participants - use a simple approach: mark as speaking when audio is active
    // Daily.co tracks this internally, we'll use participant state updates
    // For a more accurate detection, we could use audio level analysis, but this is simpler

    // initial update
    updateParticipants();

    const handleAppMessage = (e: any) => {
      if (e.data.type === 'ejected') { // Handle ejected message
        console.log('You have been ejected from the room.');
        leaveRoom(); // Ejected participant leaves the room

        setTimeout(() => {
          console.warn('You have been ejected from the meeting by the admin.');
          // TODO: Show toast notification in the component using this context
        }, 1000);
      }
      else if (e.data.type === 'webinar-status-changed') {
        setWebinarStatus(e.data.status);
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
    const adminAndGuest = participants.filter((p: any) => { return p.name.includes('Guest') || p.name.includes('Admin') }).map((p: any) => p.id)
    try {
      await dailyRoom.startRecording({
        type: "cloud",
        layout: {
          preset: "custom",
          composition_id: "daily:baseline",
          composition_params: {
            mode: "dominant",
            'videoSettings.preferScreenshare': true,
            'videoSettings.dominant.position': 'left',
            'videoSettings.dominant.splitPos': 0.8,
            'videoSettings.dominant.splitMargin_gu': 0,
            'videoSettings.dominant.numChiclets': 5,
            'videoSettings.dominant.itemInterval_gu': 0.7,
            'videoSettings.dominant.outerPadding_gu': 0.5,
            'videoSettings.dominant.sharpCornersOnMain': true,

            //
            // PARTICIPANT LABELS
            //
            'videoSettings.showParticipantLabels': true,
            'videoSettings.labels.fontFamily': 'Roboto',
            'videoSettings.labels.fontWeight': '600',
            'videoSettings.labels.fontSize_pct': 100,
            'videoSettings.labels.offset_x_gu': 0,
            'videoSettings.labels.offset_y_gu': 0,
            'videoSettings.labels.color': 'white',
            'videoSettings.labels.strokeColor': 'rgba(0, 0, 0, 0.9)',
          },
          participants: {
            video: adminAndGuest,
            audio: ["*"],
          },
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

  const sendWebinarStatusChange = async (status: string) => {
    if (!dailyRoom) return;
    try {
      dailyRoom.sendAppMessage({ type: 'webinar-status-changed', status: status }, '*');
    } catch (err) {
      console.error('Error sending webinar status change:', err);
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
        audio: p.audio,
        video: p.video,
        speaking: speakingParticipants.has(p.session_id),
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

  /* ---------- Device switching during meeting ---------- */

  const switchCamera = async (deviceId: string) => {
    if (!dailyRoom || !joined) {
      console.warn('Cannot switch camera: not in a meeting');
      return;
    }

    try {
      setSelectedCamera(deviceId);
      await dailyRoom.setInputDevicesAsync({
        videoDeviceId: deviceId,
      });
      console.log(`Camera switched to: ${deviceId}`);
    } catch (err) {
      console.error('Error switching camera:', err);
    }
  };

  const switchMicrophone = async (deviceId: string) => {
    if (!dailyRoom || !joined) {
      console.warn('Cannot switch microphone: not in a meeting');
      return;
    }

    try {
      setSelectedMicrophone(deviceId);
      await dailyRoom.setInputDevicesAsync({
        audioDeviceId: deviceId,
      });
      console.log(`Microphone switched to: ${deviceId}`);
    } catch (err) {
      console.error('Error switching microphone:', err);
    }
  };

  const switchSpeaker = async (deviceId: string) => {
    if (!dailyRoom || !joined) {
      console.warn('Cannot switch speaker: not in a meeting');
      return;
    }

    try {
      setSelectedSpeaker(deviceId);
      // Use Daily.co's setOutputDeviceAsync if available, otherwise use HTML5 setSinkId
      if (dailyRoom.setOutputDeviceAsync) {
        await dailyRoom.setOutputDeviceAsync({ outputDeviceId: deviceId });
      } else {
        // Fallback: try to set sinkId on audio elements
        const audioElements = document.querySelectorAll('audio');
        for (const audio of audioElements) {
          if ((audio as any).setSinkId) {
            try {
              await (audio as any).setSinkId(deviceId);
            } catch (e) {
              console.warn('setSinkId not supported or failed:', e);
            }
          }
        }
      }
      console.log(`Speaker switched to: ${deviceId}`);
    } catch (err) {
      console.error('Error switching speaker:', err);
    }
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
      console.warn('Your browser does not support virtual backgrounds (video processing). Try Chrome/Edge/Firefox on desktop.');
      // TODO: Show toast notification in the component using this context
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
        switchCamera,
        switchMicrophone,
        switchSpeaker,
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
        sendWebinarStatusChange,
        localParticipant, // Provide localParticipant
        hasLocalAudioPermission, // Provide hasLocalAudioPermission
        webinarStatus,
        setWebinarStatus,
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
