import React, { useEffect, useState } from 'react';
import type { User } from '../types';
import { ProfileCard } from './ProfileCard';
import { SearchFilter } from './SearchFilter';
import { AppointmentModal } from './AppointmentModal';
import { ReviewModal } from './ReviewModal';
import { useAuth } from '../contexts/AuthContext';
import { useUsers, type UserSearchFilters } from '../hooks/useUsers';

interface ProfilesGridProps {
  onContact: (userId: string) => void;
}

export function ProfilesGrid({ onContact }: ProfilesGridProps) {
  const { currentUser } = useAuth();
  const { users, isLoading, error, meta, searchUsers } = useUsers();
  const [bookingTarget, setBookingTarget] = useState<User | null>(null);
  const [reviewTarget, setReviewTarget] = useState<User | null>(null);

  useEffect(() => {
    searchUsers({});
  }, [searchUsers]);

  const handleSearch = (filters: UserSearchFilters) => {
    searchUsers(filters);
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12 text-gray-500">
        Please log in to browse Chartered Accountants.
      </div>
    );
  }

  return (
    <div>
      <SearchFilter onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}

      {isLoading && users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No Chartered Accountants found.</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search filters.</p>
        </div>
      ) : (
        <>
          {meta && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {users.length} of {meta.total} CAs
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {users.map(user => (
              <ProfileCard
                key={user.id}
                user={user}
                onContact={onContact}
                onBook={currentUser.role === 'client' ? setBookingTarget : undefined}
                onReview={currentUser.role === 'client' ? setReviewTarget : undefined}
              />
            ))}
          </div>
        </>
      )}

      {bookingTarget && (
        <AppointmentModal
          ca={bookingTarget}
          onClose={() => setBookingTarget(null)}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          ca={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
