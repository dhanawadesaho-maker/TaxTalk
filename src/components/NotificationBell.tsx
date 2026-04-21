import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import type { Notification } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNotificationClick?: (n: Notification) => void;
}

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-6">No notifications</p>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) onMarkAsRead(n.id);
                    onNotificationClick?.(n);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !n.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <p className={`text-sm font-medium ${!n.isRead ? 'text-blue-900' : 'text-gray-800'}`}>
                    {n.title}
                  </p>
                  {n.body && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
