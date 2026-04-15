import { useState, useEffect, useCallback, useRef } from 'react';
import type { Notification, ApiResponse } from '../types';
import { api } from '../services/api';

const POLL_INTERVAL_MS = Number(import.meta.env.VITE_POLLING_INTERVAL_MS ?? 30_000);

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<Notification[]>>('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.meta?.unreadCount ?? res.data.filter(n => !n.isRead).length);
    } catch {
      // silently fail for polling
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, POLL_INTERVAL_MS);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // non-critical
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/read-all', {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // non-critical
    }
  }, []);

  return { notifications, unreadCount, isLoading, fetchNotifications, markAsRead, markAllAsRead };
}
