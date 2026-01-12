import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDailyMeeting } from './DailyMeetingContext';
import { webinarApi } from '@/lib/api';

interface PinnedMessage {
    id: string;
    text: string;
    senderName?: string;
    createdAt?: string;
}

interface ChatContextType {
    pinnedMessages: PinnedMessage[];
    isLoadingPinnedMessages: boolean;
    pinMessage: (webinarId: string, messageId: string, messageText: string, senderName: string, createdAt: string) => void;
    unpinMessage: (webinarId: string, messageId: string) => void;
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
    const [isLoadingPinnedMessages, setIsLoadingPinnedMessages] = useState(false);
    const { dailyRoom } = useDailyMeeting();

    // Load pinned messages from database on mount
    const loadPinnedMessages = useCallback(async () => {
        if (!webinarId) return;
        try {
            setIsLoadingPinnedMessages(true);
            const response = await webinarApi.getPinnedMessages(webinarId);
            const pinned: PinnedMessage[] = response.data.pinnedMessages.map((msg: any) => ({
                id: msg._id,
                text: msg.text,
                senderName: msg.senderName,
                createdAt: msg.createdAt,
            }));
            setPinnedMessages(pinned);
        } catch (error) {
            console.error('Error loading pinned messages from database:', error);
        } finally {
            setIsLoadingPinnedMessages(false);
        }
    }, [webinarId]);

    // Pin a message - broadcasts via Daily.co and saves to database in background
    const pinMessage = useCallback((
        webinarId: string,
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
            // Add new pinned message at the end (newest at bottom)
            return [...prev, newPinnedMessage];
        });

        // Broadcast pin event via Daily.co (for real-time sync)
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

        // Save to database in background (don't wait for response)
        if (webinarId) {
            webinarApi.pinMessage(webinarId, messageId).catch(error => {
                console.error('Error saving pin status to database:', error);
                // Optionally revert on error, but usually we keep the optimistic update
            });
        }
    }, [dailyRoom]);

    // Unpin a message - broadcasts via Daily.co and saves to database in background
    const unpinMessage = useCallback((webinarId: string, messageId: string) => {
        if (!dailyRoom) return;

        // Remove from local state immediately (optimistic update)
        setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId));

        // Broadcast unpin event via Daily.co (for real-time sync)
        (dailyRoom as any).sendAppMessage({
            message: {
                type: "pin-message",
                messageId,
                isPinned: false,
            }
        }, '*');

        // Save to database in background (don't wait for response)
        if (webinarId) {
            webinarApi.unpinMessage(webinarId, messageId).catch(error => {
                console.error('Error saving unpin status to database:', error);
                // Optionally revert on error, but usually we keep the optimistic update
            });
        }
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
                        // Add new pinned message at the end (newest at bottom)
                        return [...prev, newPinnedMessage];
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

    // Load pinned messages from database on mount and when webinarId changes
    useEffect(() => {
        if (webinarId) {
            loadPinnedMessages();
        } else {
            setPinnedMessages([]);
        }
    }, [webinarId, loadPinnedMessages]);

    const value: ChatContextType = {
        pinnedMessages,
        isLoadingPinnedMessages,
        pinMessage,
        unpinMessage,
        clearPinnedMessages,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

