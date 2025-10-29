import React from 'react';
import { MessageSquare, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
  onMessagesClick?: () => void;
}

export function Navbar({ onLoginClick, onSignupClick, onMessagesClick }: NavbarProps) {
  const { currentUser, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                TAXTALK
              </h1>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-3">
                  <img
                    className="h-8 w-8 rounded-full border-2 border-blue-200"
                    src={currentUser.profileImage}
                    alt={currentUser.name}
                  />
                  <span className="text-gray-700 font-medium">{currentUser.name}</span>
                </div>
                
                {onMessagesClick && (
                  <button
                    onClick={onMessagesClick}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Messages
                  </button>
                )}
                
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
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