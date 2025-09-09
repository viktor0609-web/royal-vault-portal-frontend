
import { useState } from "react";
import { BoxSelectIcon, UserIcon } from "lucide-react";
import { Button } from "../ui/button";
import { ChatBox } from "./ChatBox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import DailyIframe from '@daily-co/daily-js';  // Use the default import

export const VideoMeeting = () => {
  const [roomUrl, setRoomUrl] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  const [dailyRoom, setDailyRoom] = useState<any>(null);

  // Function to create a room using Daily.co API
  const createRoom = async () => {
    try {
      const response = await fetch("https://api.daily.co/v1/rooms", {
        method: "POST",
        headers: {
          "Authorization": `Bearer 85449cae7812e25f542e4ee14a40b7fdcd974a017c1714ba07ce09477c548e64`, // Replace with your Daily.co API key
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.url) {
        setRoomUrl(data.url); // Set the room URL to join later
      } else {
        console.error("Failed to create room:", data);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };
  const joinRoom = () => {
    if (!roomUrl) {
      alert("Please create a room first.");
      return;
    }

    // Create the iframe and join the room
    const container = document.getElementById("daily-iframe-container");

    const iframe = DailyIframe.createFrame(container!, {
      url: roomUrl,
      showLeaveButton: true,
      iframeStyle: {
        width: "100%",
        height: "100%",
        border: "0",
        borderRadius: "8px",
      },
    });

    iframe.join().then(() => {
      setDailyRoom(iframe);
      setJoined(true);
    }).catch((error) => {
      console.error("Error joining room:", error);
    });
  };

  // Function to leave the room
  const leaveRoom = () => {
    if (dailyRoom) {
      dailyRoom.leave();
      setJoined(false);
      setRoomUrl('');
    }
  };

  // Function to copy the room URL
  const copyRoomUrl = () => {
    if (roomUrl) {
      navigator.clipboard.writeText(roomUrl).then(() => {
        alert("Room URL copied to clipboard!");
      }).catch((error) => {
        console.error("Failed to copy URL:", error);
      });
    }
  };
  return (
    <div className="flex flex-col p-4 h-screen w-screen">
      <div className="flex justify-between bg-white p-6 rounded-lg border border-royal-light-gray mb-3">
        <div className="flex gap-4 items-center">
          <BoxSelectIcon className="h-10 w-10 text-royal-gray" />
          <h1 className="text-2xl font-bold text-royal-dark-gray mb-2 uppercase">Elite Coaching 09-30-25</h1>
        </div>
        <div className="flex items-center gap-2">
          <p className="mr-5">0&nbsp;Viewers&nbsp;Attended</p>
          <UserIcon className="w-10"/>
          <Select>
            <SelectTrigger className="border-royal-light-gray">
              <SelectValue placeholder={'Choose an Option...'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="placeholder">Coming Soon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="flex flex-col gap-3 w-48 p-4 border-r overflow-y-auto">
          <h2>Calendars</h2>
          <Button>Discovery</Button>
          <Button>Consult</Button>
        </div>

        {/* Video / Room Area */}
        <div className="flex-1 p-4 flex flex-col">
          {!joined ? (
            <div>
              {!roomUrl ? (
                <Button onClick={createRoom}>Create Room</Button>
              ) : (
                <div>
                  <Button onClick={joinRoom}>Join Room</Button>
                  <Button onClick={copyRoomUrl} className="ml-4">Copy Room URL</Button>
                  <p>Share this URL with others: {roomUrl}</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2>Joined the Room</h2>
              <Button onClick={leaveRoom}>Leave Room</Button>
            </div>
          )}

          {/* Video container expands to fill leftover space */}
          <div id="daily-iframe-container" className="flex-1 bg-gray-200 mt-4 rounded-lg">

          </div>
          <div className="flex gap-4 mt-3">
            <Button className="w-1/2">Everyone Allowed</Button>
            <Button className="w-1/2">Viewer Can Speak</Button>
          </div>
        </div>

        {/* Chat */}
        <div className="w-80 p-4 border-l overflow-y-auto">
          <ChatBox dailyRoom={dailyRoom} userName="victor" />
        </div>
      </div>
    </div>
  );
}