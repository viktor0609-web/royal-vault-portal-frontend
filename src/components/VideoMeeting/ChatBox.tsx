import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { DailyCall } from '@daily-co/daily-js';
import { useDailyMeeting } from "../../context/DailyMeetingContext";
import { Smile, Pin, PinOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { webinarApi } from '../../lib/api';

interface Message {
  id: string;
  SenderUserId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isPinned?: boolean;
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
  webinarId?: string; // Webinar ID to associate chat messages
  onPinChange?: () => void; // Callback when a message is pinned/unpinned
}

export interface ChatBoxRef {
  updateMessagePinStatus: (messageId: string, isPinned: boolean) => void;
}

export const ChatBox = React.forwardRef<ChatBoxRef, ChatBoxProps>(
  ({ isVisible = true, onUnreadCountChange, isAdmin = false, webinarId, onPinChange }, ref) => {
    const { dailyRoom, role } = useDailyMeeting();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [unreadCount, setUnreadCount] = useState(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastVisibleMessageId = useRef<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState<{ top: number; left: number } | null>(null);
    const userInfo = useAuth();
    const hasLoadedMessages = useRef(false);

    // Expose function to update message pin status
    useImperativeHandle(ref, () => ({
      updateMessagePinStatus: (messageId: string, isPinned: boolean) => {
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isPinned }
            : msg
        ));
      }
    }));

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
      setEmojiPickerPosition(null);
      inputRef.current?.focus();
    };

    // Update emoji picker position when it opens
    useEffect(() => {
      if (showEmojiPicker && inputRef.current) {
        const updatePosition = () => {
          const rect = inputRef.current?.getBoundingClientRect();
          if (rect) {
            // Position above the input field
            const pickerHeight = 220; // Approximate height of emoji picker
            const margin = 8;
            setEmojiPickerPosition({
              top: rect.top + window.scrollY - pickerHeight - margin,
              left: rect.left + window.scrollX,
            });
          }
        };
        updatePosition();
        const interval = setInterval(updatePosition, 100); // Update position periodically
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
          clearInterval(interval);
          window.removeEventListener('resize', updatePosition);
          window.removeEventListener('scroll', updatePosition, true);
        };
      } else {
        setEmojiPickerPosition(null);
      }
    }, [showEmojiPicker]);

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

    // Load past messages from database when webinarId is available
    useEffect(() => {
      const loadPastMessages = async () => {
        if (!webinarId || hasLoadedMessages.current) return;

        try {
          setIsLoadingMessages(true);
          const response = await webinarApi.getChatMessages(webinarId);
          const pastMessages: Message[] = response.data.messages.map((msg: any) => ({
            id: msg._id || crypto.randomUUID(),
            SenderUserId: msg.senderUserId?._id || msg.senderUserId || '',
            senderName: msg.senderName || '',
            text: msg.text || '',
            timestamp: new Date(msg.createdAt || msg.timestamp).getTime() || Date.now(),
            isPinned: msg.isPinned || false,
          }));

          if (pastMessages.length > 0) {
            setMessages(pastMessages);
            hasLoadedMessages.current = true;
          }
        } catch (error) {
          console.error('Error loading past chat messages:', error);
          // Continue without past messages if there's an error
        } finally {
          setIsLoadingMessages(false);
        }
      };

      loadPastMessages();
    }, [webinarId]);

    // Reset hasLoadedMessages when webinarId changes
    useEffect(() => {
      hasLoadedMessages.current = false;
      setMessages([]); // Clear messages when webinar changes
    }, [webinarId]);

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

        // Handle pin/unpin events
        if (event.data.message?.type === "pin-message") {
          const { messageId, isPinned } = event.data.message;
          setMessages(prev => prev.map(msg =>
            msg.id === messageId
              ? { ...msg, isPinned }
              : msg
          ));
          // Notify parent to refresh pinned messages
          onPinChange?.();
          return;
        }

        const data = event.data;
        if (!data || !data.text || !data.senderName) return;

        // Handle message ID updates (when sender gets database ID)
        if (data.updateMessageId && data.messageId) {
          // Update existing message with database ID
          setMessages(prev => prev.map(msg => {
            // Match by text, sender, and timestamp (within 5 seconds)
            if (msg.text === data.text &&
              msg.senderName === data.senderName &&
              Math.abs(msg.timestamp - (data.timestamp || 0)) < 5000 &&
              !isValidObjectId(msg.id)) {
              return { ...msg, id: data.messageId || data._id };
            }
            return msg;
          }));
          return;
        }

        // Use database ID if provided, otherwise try to find matching message by text/sender/timestamp
        let messageId = data.messageId || data._id;

        // If no database ID, try to find matching message in existing messages
        if (!messageId || !isValidObjectId(messageId)) {
          const existingMessage = messages.find(msg =>
            msg.text === data.text &&
            msg.senderName === data.senderName &&
            Math.abs(msg.timestamp - (data.timestamp || Date.now())) < 5000 // Within 5 seconds
          );
          if (existingMessage && isValidObjectId(existingMessage.id)) {
            messageId = existingMessage.id;
          } else {
            messageId = crypto.randomUUID();
          }
        }

        const newMessage: Message = {
          id: messageId,
          SenderUserId: data.SenderUserId,
          senderName: data.senderName,
          text: data.text,
          timestamp: data.timestamp || Date.now(),
          isPinned: data.isPinned || false,
        };

        setMessages(prev => {
          // Check if message already exists (avoid duplicates)
          if (prev.some(msg => msg.id === messageId || (msg.text === data.text && msg.senderName === data.senderName && Math.abs(msg.timestamp - newMessage.timestamp) < 2000))) {
            return prev;
          }
          const updatedMessages = [...prev, newMessage];
          // If chat is not visible, increment unread count
          if (!isVisible) {
            setUnreadCount(prevCount => prevCount + 1);
          }
          return updatedMessages;
        });

        // If message doesn't have database ID yet, try to save it and update the ID (in background)
        if (webinarId && !isValidObjectId(messageId)) {
          // Try to save message to get database ID (in background)
          webinarApi.saveChatMessage(webinarId, {
            senderUserId: data.SenderUserId || '',
            senderName: data.senderName,
            text: data.text,
          }).then(response => {
            if (response.data.chatMessage?._id) {
              // Update message ID with database ID
              setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, id: response.data.chatMessage._id } : msg
              ));
            }
          }).catch(error => {
            console.error('Error saving received message to database:', error);
          });
        }
      };

      dailyRoom.on('app-message', handleMessage);

      return () => {
        dailyRoom.off('app-message', handleMessage);
      };
    }, [dailyRoom, isVisible]);

    // Send a message - Optimistic update (no delay)
    const sendMessage = async () => {
      if (!dailyRoom || !input.trim()) return;

      const messageData = {
        SenderUserId: userInfo?.user?._id,
        senderName: dailyRoom.participants().local.user_name,
        text: input.trim(),
      };
      console.log(messageData);

      // Generate temporary ID for immediate display
      const tempId = crypto.randomUUID();
      const timestamp = Date.now();

      // Add message locally immediately (optimistic update)
      const newMessage: Message = {
        ...messageData,
        id: tempId,
        timestamp: timestamp,
        isPinned: false,
      };

      setMessages(prev => [...prev, newMessage]);
      setInput('');

      // Send message via Daily app-message immediately (no waiting)
      (dailyRoom as any).sendAppMessage({
        ...messageData,
        timestamp: timestamp,
      }, '*');

      // Save to database in background (don't wait for response)
      if (webinarId) {
        webinarApi.saveChatMessage(webinarId, {
          senderUserId: messageData.SenderUserId || '',
          senderName: messageData.senderName,
          text: messageData.text,
        }).then(response => {
          // Update message ID with database ID when available
          if (response.data.chatMessage?._id) {
            setMessages(prev => prev.map(msg =>
              msg.id === tempId ? { ...msg, id: response.data.chatMessage._id } : msg
            ));

            // Broadcast updated message with database ID for pinning capability
            (dailyRoom as any).sendAppMessage({
              ...messageData,
              messageId: response.data.chatMessage._id,
              _id: response.data.chatMessage._id,
              timestamp: timestamp,
              updateMessageId: true, // Flag to indicate this is an ID update
            }, '*');
          }
        }).catch(error => {
          console.error('Error saving chat message to database:', error);
          // Message is still visible and sent via Daily, so we keep it
        });
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') sendMessage();
    };

    // Clear chat function for admin
    const clearChat = async () => {
      if (!dailyRoom || !isAdmin) return;

      // Clear messages from database if webinarId is available
      if (webinarId) {
        try {
          await webinarApi.clearChatMessages(webinarId);
        } catch (error) {
          console.error('Error clearing chat messages from database:', error);
        }
      }

      // Send clear-chat message to all participants (this will also clear pinned messages)
      (dailyRoom as any).sendAppMessage({ message: { type: "clear-chat" } }, '*');

      // Clear local messages immediately
      setMessages([]);

      // Notify parent to refresh pinned messages (which will be empty now)
      onPinChange?.();
    };

    // Helper function to check if a string is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = (id: string): boolean => {
      return /^[0-9a-fA-F]{24}$/.test(id);
    };

    // Pin/unpin message function - only for Admin and Guest
    // Admin and Guest can pin/unpin ANY message (not restricted to their own messages)
    const handlePinMessage = async (messageId: string, isCurrentlyPinned: boolean) => {
      if (!dailyRoom || !webinarId) return;
      // Only allow pinning for Admin and Guest, not regular Users
      // No ownership check - admin/guest can pin any message
      if (!isAdmin && role !== "Guest") return;

      // Only allow pinning messages that have been saved to the database (have ObjectId, not UUID)
      if (!isValidObjectId(messageId)) {
        console.warn('Cannot pin message: Message must be saved to database first');
        return;
      }

      try {
        const message = messages.find(msg => msg.id === messageId);
        if (!message) return;

        if (isCurrentlyPinned) {
          // Unpin
          await webinarApi.unpinMessage(webinarId, messageId);
          // Broadcast unpin event
          (dailyRoom as any).sendAppMessage({
            message: {
              type: "pin-message",
              messageId,
              isPinned: false,
            }
          }, '*');
          // Immediately refresh pinned messages in left sidebar
          onPinChange?.();
        } else {
          // Pin
          await webinarApi.pinMessage(webinarId, messageId);
          // Broadcast pin event with message details for immediate display
          (dailyRoom as any).sendAppMessage({
            message: {
              type: "pin-message",
              messageId,
              isPinned: true,
              messageText: message.text,
              senderName: message.senderName,
              createdAt: new Date(message.timestamp).toISOString(),
            }
          }, '*');

          // Immediately refresh pinned messages in left sidebar
          onPinChange?.();
        }

        // Update local state immediately
        setMessages(prev => prev.map(msg =>
          msg.id === messageId
            ? { ...msg, isPinned: !isCurrentlyPinned }
            : msg
        ));

        // Notify parent to refresh pinned messages
        onPinChange?.();
      } catch (error) {
        console.error('Error pinning/unpinning message:', error);
      }
    };

    const [activeCtas, setActiveCtas] = useState<Array<{ index: number; label: string; link: string }>>([]);
    const isAdminOrGuest = isAdmin || role === "Guest" || role === "Admin";

    // Listen for CTA activation/cancellation events (only for regular users)
    useEffect(() => {
      if (!dailyRoom || isAdminOrGuest) return;

      const handleCtaEvent = (event: any) => {
        if (event.data.message?.type === "cta-activate") {
          const { ctaIndex, ctaLabel, ctaLink } = event.data.message;
          setActiveCtas(prev => {
            // Check if already exists
            if (prev.some(cta => cta.index === ctaIndex)) {
              return prev;
            }
            return [...prev, { index: ctaIndex, label: ctaLabel, link: ctaLink }];
          });
        }

        if (event.data.message?.type === "cta-cancel") {
          const { ctaIndex } = event.data.message;
          setActiveCtas(prev => prev.filter(cta => cta.index !== ctaIndex));
        }
      };

      dailyRoom.on('app-message', handleCtaEvent);
      return () => {
        dailyRoom.off('app-message', handleCtaEvent);
      };
    }, [dailyRoom, isAdminOrGuest]);

    return (
      <div className="flex flex-col h-full bg-white relative min-h-0 shadow-sm">
        {/* Sticky header with clear button for admin */}
        <div className="sticky top-0 z-10 flex justify-between items-center px-3 py-2.5 border-b border-gray-200 bg-gray-50 flex-shrink-0">
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

        {/* Active CTA Buttons - Sticky at top, full width, only for regular users */}
        {!isAdminOrGuest && activeCtas.length > 0 && (
          <div className="sticky top-0 z-10 flex flex-col gap-2 px-0 py-2 bg-transparent">
            {activeCtas.map((cta) => (
              <button
                key={cta.index}
                onClick={() => {
                  if (cta.link) {
                    window.open(cta.link, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="bg-red-500 text-white px-3 py-2.5 rounded-none hover:bg-red-600 transition-colors font-medium text-sm text-center w-full"
              >
                {cta.label}
              </button>
            ))}
          </div>
        )}
        {/* Messages Area - WhatsApp style */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1.5 relative min-h-0"
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
            const displayName = getDisplayName(msg.senderName);
            const isOwnMessage = msg.SenderUserId && msg.SenderUserId === userInfo?.user?._id;

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
                    className={`rounded-lg px-2.5 py-1.5 shadow-sm relative group ${isOwnMessage
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-black rounded-bl-none border border-gray-200'
                      }`}
                  >
                    {/* Pin button - visible for Admin and Guest on ALL messages (own and others), only for messages saved to database */}
                    {(isAdmin || role === "Guest") && isValidObjectId(msg.id) && (
                      <button
                        onClick={() => handlePinMessage(msg.id, msg.isPinned || false)}
                        className={`absolute -top-3 -right-3 p-2.5 rounded-full transition-all opacity-0 group-hover:opacity-100 ${msg.isPinned
                          ? 'opacity-100 bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                          }`}
                        title={msg.isPinned ? "Unpin message" : "Pin message"}
                      >
                        {msg.isPinned ? (
                          <PinOff className="h-5 w-5" />
                        ) : (
                          <Pin className="h-5 w-5" />
                        )}
                      </button>
                    )}

                    {/* Pinned indicator - only visible for Admin and Guest */}
                    {msg.isPinned && (isAdmin || role === "Guest") && (
                      <div className="absolute -top-2 left-1 flex items-center gap-1">
                        <Pin className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                      </div>
                    )}

                    {/* Message text */}
                    <p className={`break-words text-base ${isOwnMessage ? '' : 'font-normal'
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
        <div className="px-2 py-2 border-t border-gray-200 bg-white relative flex-shrink-0 overflow-visible">
          <div className="flex items-center gap-2 relative">
            <button
              className="bg-gray-100 text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              title="Add emoji"
            >
              <Smile size={20} />
            </button>

            <div className="flex-1 relative overflow-visible" ref={emojiPickerRef}>
              <input
                ref={inputRef}
                type="text"
                className="w-full border border-gray-300 rounded-full bg-white text-gray-900 px-3 py-1.5 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent placeholder:text-gray-400"
                placeholder="Type a message"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
              />
              {showEmojiPicker && emojiPickerPosition && createPortal(
                <div
                  className="emoji-picker-container fixed bg-white border border-gray-200 rounded-lg shadow-xl p-3 max-h-52 overflow-y-auto z-[9999] w-80"
                  style={{
                    top: `${emojiPickerPosition.top}px`,
                    left: `${emojiPickerPosition.left}px`,
                  }}
                >
                  <div className="grid grid-cols-8 gap-1">
                    {popularEmojis.map((emoji, index) => (
                      <button
                        key={index}
                        className="text-xl hover:bg-gray-100 rounded p-1 transition-colors flex items-center justify-center min-w-[2rem] min-h-[2rem]"
                        onClick={() => handleEmojiSelect(emoji)}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>,
                document.body
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
  });