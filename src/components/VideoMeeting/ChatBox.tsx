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
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-lg overflow-hidden">
      {/* Header with clear button for admin */}
      <div className="flex justify-between items-center px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
        <h3 className="text-base font-semibold text-gray-800">Live Chat</h3>
        {isAdmin && (
          <button
            onClick={clearChat}
            className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-full hover:bg-red-600 transition-colors font-medium shadow-sm"
            title="Clear chat for all participants"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
        {messages.map(msg => {
          const isOwnMessage = msg.sender === (dailyRoom?.participants().local.user_name || "Guest");
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              {/* Sender Name */}
              {!isOwnMessage && (
                <span className="text-xs font-semibold text-gray-600 mb-1 ml-2">
                  {msg.sender}
                </span>
              )}

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${isOwnMessage
                    ? 'bg-blue-500 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                  }`}
              >
                <p className="text-sm leading-relaxed break-words">{msg.text}</p>

                {/* Timestamp */}
                <span className={`text-xs mt-1 block ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-3 py-3 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full border border-gray-300 rounded-2xl text-gray-800 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50"
              placeholder="Type a message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {showEmojiPicker && (
              <div className="emoji-picker-container absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-xl p-3 max-h-52 overflow-y-auto z-10 w-80">
                <div className="grid grid-cols-8 gap-1">
                  {popularEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      className="text-xl hover:bg-gray-100 rounded-lg p-2 transition-colors"
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
            className="bg-gray-200 text-gray-700 p-2.5 rounded-full hover:bg-gray-300 transition-colors"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Add emoji"
          >
            <Smile size={20} />
          </button>
          <button
            className="bg-blue-500 text-white px-5 py-2.5 rounded-full hover:bg-blue-600 transition-colors font-medium shadow-sm text-sm"
            onClick={sendMessage}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};