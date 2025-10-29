import React from 'react';
import { User } from '../types';
import { ProfileCard } from './ProfileCard';
import { useAuth } from '../contexts/AuthContext';

interface ProfilesGridProps {
  users: User[];
  onContact: (userId: string) => void;
}

export function ProfilesGrid({ users, onContact }: ProfilesGridProps) {
  const { currentUser } = useAuth();

  // Filter users based on current user type
  const filteredUsers = users.filter(user => {
    if (!currentUser) return false;
    
    // Show CAs to regular users, and regular users to CAs
    if (currentUser.userType === 'user') {
      return user.userType === 'ca' && user.id !== currentUser.id;
    } else {
      return user.userType === 'user' && user.id !== currentUser.id;
    }
  });

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          {currentUser?.userType === 'user' 
            ? 'No Chartered Accountants available at the moment.'
            : 'No users seeking CA services at the moment.'
          }
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredUsers.map((user) => (
        <ProfileCard
          key={user.id}
          user={user}
          onContact={onContact}
        />
      ))}
    </div>
  );
}