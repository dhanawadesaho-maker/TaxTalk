import { useState, useCallback, useEffect, useRef } from 'react';
import type { Message, Chat, ApiResponse } from '../types';
import { api } from '../services/api';

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLLING_INTERVAL_MS ?? 30_000);

export function useChat(currentUserId: string | undefined, otherUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchChats = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await api.get<ApiResponse<Chat[]>>('/chats');
      setChats(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load chats');
    }
  }, [currentUserId]);

  const fetchMessages = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<Message[]>>(`/messages/with/${targetUserId}`);
      setMessages(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  // Poll for new messages when in a conversation
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    fetchMessages(otherUserId);
    fetchChats();

    pollRef.current = setInterval(() => {
      fetchMessages(otherUserId);
      fetchChats();
    }, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentUserId, otherUserId, fetchMessages, fetchChats]);

  // Poll chats list when no active conversation
  useEffect(() => {
    if (!currentUserId || otherUserId) return;

    fetchChats();

    pollRef.current = setInterval(fetchChats, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [currentUserId, otherUserId, fetchChats]);

  const sendMessage = useCallback(async (
    receiverId: string,
    content: string,
    attachment?: { data: string; name: string; type: string }
  ): Promise<Message | null> => {
    try {
      const res = await api.post<ApiResponse<Message>>('/messages', {
        receiverId,
        content,
        attachmentData: attachment?.data ?? null,
        attachmentName: attachment?.name ?? null,
        attachmentType: attachment?.type ?? null,
      });

      const newMessage = res.data;
      setMessages(prev => [...prev, newMessage]);
      await fetchChats();
      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return null;
    }
  }, [fetchChats]);

  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await api.put(`/messages/${messageId}/read`, {});
      setMessages(prev =>
        prev.map(m => m.id === messageId ? { ...m, isRead: true } : m)
      );
    } catch {
      // non-critical
    }
  }, []);

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      await api.delete(`/chats/${chatId}`);
      setChats(prev => prev.filter(c => c.id !== chatId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat');
    }
  }, []);

  const getMessagesForChat = useCallback(
    (userId1: string, userId2: string): Message[] =>
      messages.filter(
        m =>
          (m.senderId === userId1 && m.receiverId === userId2) ||
          (m.senderId === userId2 && m.receiverId === userId1)
      ),
    [messages]
  );

  return {
    messages,
    chats,
    isLoading,
    error,
    fetchChats,
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteChat,
    getMessagesForChat,
  };
}
