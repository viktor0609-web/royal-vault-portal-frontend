import React, { useState, useEffect, useRef } from 'react';
import { DailyCall } from '@daily-co/daily-js';
import { useDailyMeeting } from '@/context/DailyMeetingContext';
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export const ChatBox: React.FC = () => {
  const { dailyRoom } = useDailyMeeting();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when a new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  // Listen for incoming messages from Daily
  useEffect(() => {
    if (!dailyRoom) return;

    const handleMessage = (event: any) => {
      const data = event.data;
      if (!data || !data.text || !data.sender) return;

      const newMessage: Message = {
        id: crypto.randomUUID(),
        sender: data.sender,
        text: data.text,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, newMessage]);
    };

    dailyRoom.on('app-message', handleMessage);

    return () => {
      dailyRoom.off('app-message', handleMessage);
    };
  }, [dailyRoom]);

  // Send a message
  const sendMessage = () => {
    if (!dailyRoom || !input.trim()) return;

    const messageData = {
      sender: dailyRoom.participants().local.user_name || "Guest",
      text: input.trim(),
    };

    // Send message via Daily app-message
    (dailyRoom as any).sendAppMessage(messageData, '*');

    // Optionally append locally
    setMessages(prev => [...prev, { ...messageData, id: crypto.randomUUID(), timestamp: Date.now() }]);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="flex flex-col border rounded-lg p-2 h-full bg-white shadow-lg">
      <div className="flex-1 overflow-y-auto mb-2 space-y-1 px-1">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`p-2 rounded-md ${msg.sender === (dailyRoom.participants().local.user_name || "Guest") ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-gray-800 self-start'
              }`}
          >
            <span className="font-semibold text-sm">{msg.sender}: </span>
            <span className="text-sm">{msg.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex space-x-2">
        <input
          type="text"
          className="flex-1 border rounded text-black px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type a message..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};