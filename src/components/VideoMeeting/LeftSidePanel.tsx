import { Button } from "@/components/ui/button";
import { Pin, PinOff, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useDailyMeeting } from "@/context/DailyMeetingContext";
import { webinarApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { Webinar } from "@/types";

interface PinnedMessage {
  id: string;
  text: string;
  senderName?: string;
  createdAt?: string;
}

interface LeftSidePanelProps {
  webinar: Webinar | null;
  webinarId?: string;
  refreshTrigger?: number; // Trigger to refresh pinned messages
  onPinChange?: () => void; // Callback when a message is pinned/unpinned
  onUnpinMessage?: (messageId: string) => void; // Callback to update chat box when unpinning
}

export const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ webinar, webinarId, refreshTrigger, onPinChange, onUnpinMessage }) => {
  const ctas = webinar?.ctas || [];
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCtaIndices, setActiveCtaIndices] = useState<number[]>([]);
  const { dailyRoom, role } = useDailyMeeting();
  const userInfo = useAuth();
  const isAdminOrGuest = userInfo?.user?.role === "admin" || role === "Guest" || role === "Admin";

  // Fetch pinned messages
  const fetchPinnedMessages = async () => {
    if (!webinarId) return;
    try {
      setIsLoading(true);
      const response = await webinarApi.getPinnedMessages(webinarId);
      const pinned: PinnedMessage[] = response.data.pinnedMessages.map((msg: any) => ({
        id: msg._id,
        text: msg.text,
        senderName: msg.senderName,
        createdAt: msg.createdAt,
      }));
      setPinnedMessages(pinned);
    } catch (error) {
      console.error('Error fetching pinned messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load pinned messages on mount and when webinarId or refreshTrigger changes
  useEffect(() => {
    if (webinarId) {
      fetchPinnedMessages();
    }
  }, [webinarId, refreshTrigger]);

  // Listen for pin/unpin events and CTA activation from Daily.co
  useEffect(() => {
    if (!dailyRoom) return;

    const handleAppMessage = (event: any) => {
      // Handle clear-chat event - clear all pinned messages
      if (event.data.message?.type === "clear-chat") {
        setPinnedMessages([]);
        return;
      }

      // Handle pin/unpin events
      if (event.data.message?.type === "pin-message") {
        const { messageId, isPinned, messageText, senderName, createdAt } = event.data.message;
        if (isPinned) {
          // Message was pinned - add immediately to the list
          const newPinnedMessage: PinnedMessage = {
            id: messageId,
            text: messageText,
            senderName: senderName,
            createdAt: createdAt,
          };
          setPinnedMessages(prev => {
            // Check if message already exists to avoid duplicates
            if (prev.some(msg => msg.id === messageId)) {
              return prev;
            }
            return [newPinnedMessage, ...prev];
          });
        } else {
          // Message was unpinned - remove from list
          setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));
        }
      }

      // Handle CTA activation/cancellation
      if (event.data.message?.type === "cta-activate") {
        const { ctaIndex } = event.data.message;
        setActiveCtaIndices(prev => {
          if (!prev.includes(ctaIndex)) {
            return [...prev, ctaIndex];
          }
          return prev;
        });
      }

      if (event.data.message?.type === "cta-cancel") {
        const { ctaIndex } = event.data.message;
        setActiveCtaIndices(prev => prev.filter(idx => idx !== ctaIndex));
      }
    };

    dailyRoom.on('app-message', handleAppMessage);
    return () => {
      dailyRoom.off('app-message', handleAppMessage);
    };
  }, [dailyRoom]);

  // Handle unpin
  const handleUnpin = async (messageId: string) => {
    if (!webinarId || !dailyRoom) return;

    try {
      await webinarApi.unpinMessage(webinarId, messageId);

      // Broadcast unpin event
      (dailyRoom as any).sendAppMessage({
        message: {
          type: "pin-message",
          messageId,
          isPinned: false,
        }
      }, '*');

      // Update local state
      setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));

      // Notify parent to update chat panel
      onPinChange?.();

      // Directly update chat box
      onUnpinMessage?.(messageId);
    } catch (error) {
      console.error('Error unpinning message:', error);
    }
  };

  // Handle CTA activation/cancellation (toggle)
  const handleCtaClick = (index: number) => {
    if (!dailyRoom || !isAdminOrGuest) return;

    const isActive = activeCtaIndices.includes(index);

    if (isActive) {
      // Cancel the CTA
      setActiveCtaIndices(prev => prev.filter(idx => idx !== index));

      // Broadcast CTA cancellation
      (dailyRoom as any).sendAppMessage({
        message: {
          type: "cta-cancel",
          ctaIndex: index,
        }
      }, '*');
    } else {
      // Activate the CTA
      setActiveCtaIndices(prev => [...prev, index]);

      // Broadcast CTA activation
      (dailyRoom as any).sendAppMessage({
        message: {
          type: "cta-activate",
          ctaIndex: index,
          ctaLabel: ctas[index]?.label,
          ctaLink: ctas[index]?.link,
        }
      }, '*');
    }
  };

  return (
    <div className="w-full h-full bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      {/* CTA Buttons Section */}
      <div className="flex-shrink-0 border-b border-gray-200 p-4 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-800 mb-3 uppercase tracking-wide">Call to Action</h3>
        <div className="space-y-2">
          {ctas.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-3">No CTA buttons available</p>
          ) : (
            ctas.map((cta, index) => {
              const isActive = activeCtaIndices.includes(index);
              return (
                <div key={index} className="relative">
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-2.5 px-3 text-sm font-medium transition-all duration-200 ${isActive
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600'
                      : 'bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600'
                      }`}
                    onClick={() => {
                      if (isAdminOrGuest) {
                        handleCtaClick(index);
                      } else if (cta.link) {
                        window.open(cta.link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    {cta.label}
                  </Button>
                  {isActive && isAdminOrGuest && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCtaClick(index);
                      }}
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all"
                      title="Cancel CTA"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pinned Messages Section */}
      <div className="flex-1 overflow-y-auto p-4 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <Pin className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Pinned Messages</h3>
        </div>
        <div className="space-y-3">
          {isLoading ? (
            <p className="text-xs text-gray-500 text-center py-6">Loading...</p>
          ) : pinnedMessages.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No pinned messages</p>
          ) : (
            pinnedMessages.map((message) => (
              <div
                key={message.id}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 shadow-sm relative group"
              >
                {/* Unpin button */}
                <button
                  onClick={() => handleUnpin(message.id)}
                  className="absolute top-2 right-2 p-2.5 rounded-full bg-gray-200 hover:bg-red-100 text-gray-600 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                  title="Unpin message"
                >
                  <X className="h-5 w-5" />
                </button>

                {message.senderName && (
                  <div className="text-xs font-semibold text-gray-700 mb-1.5 pr-6">
                    {message.senderName}
                  </div>
                )}
                <p className="text-sm text-gray-800 leading-relaxed pr-6">{message.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

