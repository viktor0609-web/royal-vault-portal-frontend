import React, { useState, useEffect, useRef } from 'react';
import { DailyCall } from '@daily-co/daily-js';
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { Smile } from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

// Helper function to convert URLs in text to clickable links
const linkifyText = (text: string, isOwnMessage: boolean = false) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline ${isOwnMessage
            ? 'text-blue-100 hover:text-white'
            : 'text-blue-600 hover:text-blue-800'
            }`}
        >
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
};

// Clean display name by removing "(User)" role but keeping Admin/Guest
const getDisplayName = (username: string): string => {
  // Remove "(User)" or "- User" or any variation
  return username
    .replace(/\s*\(User\)\s*/gi, '')
    .replace(/\s*-\s*User\s*/gi, '')
    .trim();
};

interface ChatBoxProps {
  isVisible?: boolean;
  onUnreadCountChange?: (count: number) => void;
  isAdmin?: boolean;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ isVisible = true, onUnreadCountChange, isAdmin = false }) => {
  const { dailyRoom } = useDailyMeeting();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastVisibleMessageId = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Popular emojis for the picker
  const popularEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮',
    '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓',
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
    '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
    '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉',
    '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👏',
    '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾',
    '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀',
    '👁️', '👅', '👄', '💋', '🩸', '👶', '🧒', '👦', '👧', '🧑',
    '👨', '👩', '🧓', '👴', '👵', '👱', '👨‍🦱', '👩‍🦱', '👨‍🦰', '👩‍🦰',
    '👨‍🦳', '👩‍🦳', '👨‍🦲', '👩‍🦲', '🧔', '👵', '👲', '🧕', '👳', '👳‍♂️',
    '👳‍♀️', '👮', '👮‍♂️', '👮‍♀️', '👷', '👷‍♂️', '👷‍♀️', '💂', '💂‍♂️', '💂‍♀️',
    '🕵️', '🕵️‍♂️', '🕵️‍♀️', '👩‍⚕️', '👨‍⚕️', '👩‍🌾', '👨‍🌾', '👩‍🍳', '👨‍🍳', '👩‍🎓',
    '👨‍🎓', '👩‍🎤', '👨‍🎤', '👩‍🏫', '👨‍🏫', '👩‍🏭', '👨‍🏭', '👩‍💻', '👨‍💻', '👩‍💼',
    '👨‍💼', '👩‍🔧', '👨‍🔧', '👩‍🔬', '👨‍🔬', '👩‍🎨', '👨‍🎨', '👩‍🚒', '👨‍🚒', '👩‍✈️',
    '👨‍✈️', '👩‍🚀', '👨‍🚀', '👩‍⚖️', '👨‍⚖️', '👰', '🤵', '👸', '🤴', '🦸',
    '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🤶', '🎅', '🧙', '🧙‍♂️', '🧙‍♀️',
    '🧚', '🧚‍♂️', '🧚‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝',
    '🧝‍♂️', '🧝‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '🙍', '🙍‍♂️',
    '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️',
    '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦',
    '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️', '💆', '💆‍♂️', '💆‍♀️', '💇', '💇‍♂️',
    '💇‍♀️', '🚶', '🚶‍♂️', '🚶‍♀️', '🏃', '🏃‍♂️', '🏃‍♀️', '💃', '🕺', '🕴️',
    '👯', '👯‍♂️', '👯‍♀️', '🧖', '🧖‍♂️', '🧖‍♀️', '🧘', '🧘‍♂️', '🧘‍♀️', '🛀',
    '🛌', '👭', '👫', '👬', '💏', '💑', '👪', '🗣️', '👤', '👥',
    '🫂', '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '👐', '🤲',
    '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶',
    '👂', '🦻', '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄',
    '💋', '🩸', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '💋', '🩸', '🦵', '🦶', '👂', '🦻',
    '👃', '🧠', '🦷', '🦴', '👀', '👁️', '👅', '👄', '💋', '🩸'
  ];

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInput(prev => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker && !(event.target as Element).closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

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
      if (event.data.message?.type === "clear-chat") {
        setMessages([]);  // clear local history
        return;
      }
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

  // Clear chat function for admin
  const clearChat = () => {
    if (!dailyRoom || !isAdmin) return;

    // Send clear-chat message to all participants
    (dailyRoom as any).sendAppMessage({ message: { type: "clear-chat" } }, '*');

    // Clear local messages immediately
    setMessages([]);
    localStorage.removeItem('chat-messages');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header with clear button for admin */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h3 className="text-base font-semibold text-gray-800">Live Chat</h3>
        {isAdmin && (
          <button
            onClick={clearChat}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-md hover:bg-red-600 transition-colors font-medium"
            title="Clear chat for all participants"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area - WhatsApp style */}
      <div
        className="flex-1 overflow-y-auto px-3 py-2 relative"
        style={{
          backgroundColor: '#efeae2',
          backgroundImage: `
            linear-gradient(45deg, rgba(0,0,0,.02) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(0,0,0,.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0,0,0,.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0,0,0,.02) 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {messages.map(msg => {
          const displayName = getDisplayName(msg.sender);
          const isOwnMessage = msg.sender === (dailyRoom?.participants().local.user_name || "Guest");

          return (
            <div
              key={msg.id}
              className={`flex mb-2 animate-in fade-in duration-200 ${isOwnMessage ? 'justify-end' : 'justify-start'
                }`}
            >
              <div className={`max-w-[75%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                {/* Sender name - only show for other people's messages */}
                {!isOwnMessage && (
                  <div className="text-xs font-semibold text-gray-700 mb-1 px-1">
                    {displayName}
                  </div>
                )}

                {/* Message bubble */}
                <div
                  className={`rounded-lg px-3 py-2 shadow-md ${isOwnMessage
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-black rounded-bl-none border border-gray-200'
                    }`}
                >
                  {/* Message text */}
                  <p className={`break-words ${isOwnMessage ? 'text-sm' : 'text-[15px] font-normal'
                    }`} style={{ lineHeight: '1.5' }}>
                    {linkifyText(msg.text, isOwnMessage)}
                  </p>

                  {/* Timestamp at bottom right of bubble */}
                  <div className={`text-[10px] mt-1 text-right ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'
                    }`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 border-t border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <button
            className="bg-gray-100 text-gray-700 p-2 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            <Smile size={20} />
          </button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full border border-gray-300 rounded-full text-gray-900 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              placeholder="Type a message"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {showEmojiPicker && (
              <div className="emoji-picker-container absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-h-52 overflow-y-auto z-10 w-80">
                <div className="grid grid-cols-8 gap-1">
                  {popularEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="text-xl hover:bg-gray-100 rounded p-1 transition-colors"
                      onClick={() => handleEmojiSelect(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors font-medium flex-shrink-0"
            onClick={sendMessage}
            title="Send message"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};