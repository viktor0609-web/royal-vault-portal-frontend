import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDailyMeeting } from './DailyMeetingContext';

interface PinnedMessage {
    id: string;
    text: string;
    senderName?: string;
    createdAt?: string;
}

interface ChatContextType {
    pinnedMessages: PinnedMessage[];
    isLoadingPinnedMessages: boolean;
    pinMessage: (messageId: string, messageText: string, senderName: string, createdAt: string) => void;
    unpinMessage: (messageId: string) => void;
    clearPinnedMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};

interface ChatProviderProps {
    children: React.ReactNode;
    webinarId?: string;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children, webinarId }) => {
    const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
    const [isLoadingPinnedMessages] = useState(false);
    const { dailyRoom } = useDailyMeeting();

    // Pin a message - only broadcasts via Daily.co, no database
    const pinMessage = useCallback((
        messageId: string,
        messageText: string,
        senderName: string,
        createdAt: string
    ) => {
        if (!dailyRoom) return;

        // Add to local state immediately (optimistic update)
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
            // Add new pinned message at the beginning (newest first)
            return [newPinnedMessage, ...prev];
        });

        // Broadcast pin event via Daily.co
        (dailyRoom as any).sendAppMessage({
            message: {
                type: "pin-message",
                messageId,
                isPinned: true,
                messageText,
                senderName,
                createdAt,
            }
        }, '*');
    }, [dailyRoom]);

    // Unpin a message - only broadcasts via Daily.co, no database
    const unpinMessage = useCallback((messageId: string) => {
        if (!dailyRoom) return;

        // Remove from local state immediately (optimistic update)
        setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));

        // Broadcast unpin event via Daily.co
        (dailyRoom as any).sendAppMessage({
            message: {
                type: "pin-message",
                messageId,
                isPinned: false,
            }
        }, '*');
    }, [dailyRoom]);

    // Clear all pinned messages
    const clearPinnedMessages = useCallback(() => {
        setPinnedMessages([]);
    }, []);

    // Listen for pin/unpin events from Daily.co
    useEffect(() => {
        if (!dailyRoom) return;

        const handleAppMessage = (event: any) => {
            // Handle clear-chat event
            if (event.data.message?.type === "clear-chat") {
                clearPinnedMessages();
                return;
            }

            // Handle pin/unpin events from Daily.co
            if (event.data.message?.type === "pin-message") {
                const { messageId, isPinned, messageText, senderName, createdAt } = event.data.message;

                if (isPinned) {
                    // Message was pinned - add to list
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
                        // Add new pinned message at the beginning (newest first)
                        return [newPinnedMessage, ...prev];
                    });
                } else {
                    // Message was unpinned - remove from list
                    setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));
                }
            }
        };

        dailyRoom.on('app-message', handleAppMessage);
        return () => {
            dailyRoom.off('app-message', handleAppMessage);
        };
    }, [dailyRoom, clearPinnedMessages]);

    // Clear pinned messages when webinarId changes
    useEffect(() => {
        setPinnedMessages([]);
    }, [webinarId]);

    const value: ChatContextType = {
        pinnedMessages,
        isLoadingPinnedMessages,
        pinMessage,
        unpinMessage,
        clearPinnedMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

