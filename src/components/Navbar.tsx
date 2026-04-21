import React from 'react';
import { MessageSquare, LogOut, Settings, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { NotificationBell } from './NotificationBell';
import type { Notification } from '../types';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onMessagesClick?: () => void;
  onBookingsClick?: () => void;
  onEditProfile?: () => void;
  onNotificationClick?: (n: Notification) => void;
}

export function Navbar({ onLoginClick, onSignupClick, onMessagesClick, onBookingsClick, onEditProfile, onNotificationClick }: NavbarProps) {
  const { currentUser, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(currentUser?.id);

  const avatarSrc = currentUser?.profileImage
    ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser?.fullName ?? 'user')}`;

  return (
    <nav className="bg-white shadow-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              TAXTALK
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <>
                <NotificationBell
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onNotificationClick={onNotificationClick}
                />

                {onMessagesClick && (
                  <button
                    onClick={onMessagesClick}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </button>
                )}

                {onBookingsClick && (
                  <button
                    onClick={onBookingsClick}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Bookings
                  </button>
                )}

                <div className="flex items-center space-x-2 px-2 py-1">
                  <img
                    className="h-8 w-8 rounded-full border-2 border-blue-200 object-cover"
                    src={avatarSrc}
                    alt={currentUser.fullName}
                  />
                  <span className="text-gray-700 font-medium text-sm hidden sm:block">
                    {currentUser.fullName}
                  </span>
                  {currentUser.role === 'ca' && (
                    <span className="hidden sm:block text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      CA
                    </span>
                  )}
                </div>

                {onEditProfile && (
                  <button
                    onClick={onEditProfile}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    title="Edit Profile"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLoginClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Login
                </button>
                <button
                  onClick={onSignupClick}
                  className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
