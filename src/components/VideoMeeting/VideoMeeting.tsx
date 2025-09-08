import { MeetingLayout, Participant } from "@/components/ui/videomeeting";
import * as React from "react";

export const VideoMeeting = () => {
  const [participants, setParticipants] = React.useState<Participant[]>([
    { id: "1", name: "You" },
    { id: "2", name: "Alice", muted: true },
  ]);

  const [messages, setMessages] = React.useState<string[]>([]);
  const [micOn, setMicOn] = React.useState(true);
  const [camOn, setCamOn] = React.useState(true);

  return (
    <div>
      <MeetingLayout
        participants={participants}
        messages={messages}
        micOn={micOn}
        camOn={camOn}
        onToggleMic={() => setMicOn((m) => !m)}
        onToggleCam={() => setCamOn((c) => !c)}
        onScreenShare={() => console.log("Share screen")}
        onLeave={() => console.log("Leave meeting")}
        onSendMessage={(msg) => setMessages((prev) => [...prev, msg])}
      />
    </div>
  );
}