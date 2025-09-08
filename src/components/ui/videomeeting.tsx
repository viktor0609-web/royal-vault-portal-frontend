import * as React from "react";
import { Mic, MicOff, Video, VideoOff, Monitor, PhoneOff, User } from "lucide-react";
import { cn } from "@/lib/utils";

/* ----------------------------- VideoTile ----------------------------- */
export interface VideoTileProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
}

export const VideoTile = React.forwardRef<HTMLDivElement, VideoTileProps>(
  ({ name, isMuted, isCameraOff, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative bg-gray-800 rounded-xl flex items-center justify-center text-white text-lg font-semibold overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gray-700 animate-pulse" />
      <span className="relative z-10">{name}</span>

      {isMuted && (
        <div className="absolute top-2 right-2 bg-red-600 text-xs px-2 py-0.5 rounded">
          Muted
        </div>
      )}
      {isCameraOff && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-10">
          <span className="text-sm">Camera Off</span>
        </div>
      )}
    </div>
  )
);
VideoTile.displayName = "VideoTile";

/* ----------------------------- VideoGrid ----------------------------- */
export interface Participant {
  id: string;
  name: string;
  muted?: boolean;
  camOff?: boolean;
}

export interface VideoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  participants: Participant[];
}

export const VideoGrid = React.forwardRef<HTMLDivElement, VideoGridProps>(
  ({ participants, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex-1 grid gap-4 p-4 bg-black grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
      {...props}
    >
      {participants.map((p) => (
        <VideoTile
          key={p.id}
          name={p.name}
          isMuted={p.muted}
          isCameraOff={p.camOff}
        />
      ))}
    </div>
  )
);
VideoGrid.displayName = "VideoGrid";

/* ----------------------------- ControlButton ----------------------------- */
export interface ControlButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  danger?: boolean;
}

export const ControlButton = React.forwardRef<
  HTMLButtonElement,
  ControlButtonProps
>(({ className, active, danger, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "p-3 rounded-full transition-colors",
      danger
        ? "bg-red-600 text-white hover:bg-red-500"
        : active
        ? "bg-blue-600 text-white hover:bg-blue-500"
        : "bg-gray-700 text-white hover:bg-gray-600",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
ControlButton.displayName = "ControlButton";

/* ----------------------------- ControlBar ----------------------------- */
export interface ControlBarProps {
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onScreenShare: () => void;
  onLeave: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onScreenShare,
  onLeave,
}) => (
  <div className="flex items-center justify-center gap-6 bg-gray-900 py-4 border-t border-gray-700">
    <ControlButton onClick={onToggleMic} active={micOn}>
      {micOn ? <Mic size={20} /> : <MicOff size={20} />}
    </ControlButton>

    <ControlButton onClick={onToggleCam} active={camOn}>
      {camOn ? <Video size={20} /> : <VideoOff size={20} />}
    </ControlButton>

    <ControlButton onClick={onScreenShare}>
      <Monitor size={20} />
    </ControlButton>

    <ControlButton danger onClick={onLeave}>
      <PhoneOff size={20} />
    </ControlButton>
  </div>
);

/* ----------------------------- ViewerList ----------------------------- */
export interface ViewerListProps extends React.HTMLAttributes<HTMLDivElement> {
  viewers: string[];
}

export const ViewerList = React.forwardRef<HTMLDivElement, ViewerListProps>(
  ({ viewers, className, ...props }, ref) => (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      <h2 className="text-sm font-semibold text-gray-600 mb-2">
        Participants ({viewers.length})
      </h2>
      <ul className="space-y-1">
        {viewers.map((viewer, i) => (
          <li
            key={i}
            className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 text-sm"
          >
            <User className="w-4 h-4 text-gray-500" />
            <span>{viewer}</span>
          </li>
        ))}
      </ul>
    </div>
  )
);
ViewerList.displayName = "ViewerList";

/* ----------------------------- ChatBox ----------------------------- */
export interface ChatBoxProps {
  messages: string[];
  onSend: (msg: string) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSend }) => {
  const [input, setInput] = React.useState("");

  const sendMessage = () => {
    if (input.trim()) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="flex flex-col h-full border-t border-gray-300">
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-white">
        {messages.map((msg, i) => (
          <div key={i} className="bg-gray-200 rounded px-3 py-1 text-sm">
            {msg}
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded focus:outline-none"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

/* ----------------------------- MeetingLayout ----------------------------- */
export interface MeetingLayoutProps {
  participants: Participant[];
  messages: string[];
  micOn: boolean;
  camOn: boolean;
  onToggleMic: () => void;
  onToggleCam: () => void;
  onScreenShare: () => void;
  onLeave: () => void;
  onSendMessage: (msg: string) => void;
}

export const MeetingLayout: React.FC<MeetingLayoutProps> = ({
  participants,
  messages,
  micOn,
  camOn,
  onToggleMic,
  onToggleCam,
  onScreenShare,
  onLeave,
  onSendMessage,
}) => (
  <div className="w-screen h-screen flex bg-gray-50">
    {/* Main */}
    <div className="flex-1 flex flex-col">
      <VideoGrid participants={participants} />
      <ControlBar
        micOn={micOn}
        camOn={camOn}
        onToggleMic={onToggleMic}
        onToggleCam={onToggleCam}
        onScreenShare={onScreenShare}
        onLeave={onLeave}
      />
    </div>

    {/* Sidebar */}
    <div className="w-80 h-full bg-gray-100 text-black flex flex-col border-l border-gray-300">
      <div className="p-4 border-b border-gray-300">
        <ViewerList viewers={participants.map((p) => p.name)} />
      </div>
      <div className="flex-1 flex flex-col">
        <ChatBox messages={messages} onSend={onSendMessage} />
      </div>
    </div>
  </div>
);
