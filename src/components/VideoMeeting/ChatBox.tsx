import React, { useState, useEffect, useRef } from 'react';
import { DailyCall } from '@daily-co/daily-js';
import { useDailyMeeting } from "../../context/DailyMeetingContext";

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ChatBoxProps {
  isVisible?: boolean;
  onUnreadCountChange?: (count: number) => void;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isVisible = true, onUnreadCountChange }) => {
  const { dailyRoom } = useDailyMeeting();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastVisibleMessageId = useRef<string | null>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading chat messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat-messages', JSON.stringify(messages));
    }
  }, [messages]);

  // Track unread messages when chat is not visible
  useEffect(() => {
    if (!isVisible && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastVisibleMessageId.current !== lastMessage.id) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [messages, isVisible]);

  // Clear unread count when chat becomes visible
  useEffect(() => {
    if (isVisible) {
      setUnreadCount(0);
      if (messages.length > 0) {
        lastVisibleMessageId.current = messages[messages.length - 1].id;
      }
      onUnreadCountChange?.(0);
    }
  }, [isVisible, messages, onUnreadCountChange]);

  // Notify parent component of unread count changes
  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

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

      setMessages(prev => {
        const updatedMessages = [...prev, newMessage];
        // If chat is not visible, increment unread count
        if (!isVisible) {
          setUnreadCount(prevCount => prevCount + 1);
        }
        return updatedMessages;
      });
    };

    dailyRoom.on('app-message', handleMessage);

    return () => {
      dailyRoom.off('app-message', handleMessage);
    };
  }, [dailyRoom, isVisible]);

  // Send a message
  const sendMessage = () => {
    if (!dailyRoom || !input.trim()) return;

    const messageData = {
      sender: dailyRoom.participants().local.user_name || "Guest",
      text: input.trim(),
    };

    // Send message via Daily app-message
    (dailyRoom as any).sendAppMessage(messageData, '*');

    // Add message locally (don't increment unread count for own messages)
    const newMessage: Message = {
      ...messageData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMessage]);
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