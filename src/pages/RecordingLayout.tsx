import { useParams } from 'react-router-dom';
import { DailyMeetingProvider } from '../context/DailyMeetingContext';
import { UserMeeting } from '../components/VideoMeeting/User/UserMeeting';
import { AdminMeeting } from '../components/VideoMeeting/Admin/AdminMeeting';
import { GuestMeeting } from '../components/VideoMeeting/Guest/GuestMeeting';
import { useEffect } from 'react';

// Component to set room URL from query params
const RecordingLayoutContent = () => {
  const { role } = useParams<{ role: string }>();
  
  // Set the room URL from query params
  const urlParams = new URLSearchParams(window.location.search);
  const roomUrl = urlParams.get('room_url') || '';
  
  return (
    <div style={{ 
      width: '1920px', 
      height: '1080px', 
      backgroundColor: '#000',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {role === 'admin' && <AdminMeeting />}
      {role === 'user' && <UserMeeting />}
      {role === 'guest' && <GuestMeeting />}
    </div>
  );
};

export const RecordingLayout = () => {
  // Set the room URL from query params before rendering the provider
  const urlParams = new URLSearchParams(window.location.search);
  const roomUrl = urlParams.get('room_url') || '';
  
  return (
    <DailyMeetingProvider>
      <RecordingLayoutContent />
    </DailyMeetingProvider>
  );
};
