import React from 'react';
import { Star, Phone, Award, MessageCircle, Calendar } from 'lucide-react';
import type { User } from '../types';

interface ProfileCardProps {
  user: User;
  onContact: (userId: string) => void;
  onBook?: (user: User) => void;
  onReview?: (user: User) => void;
}

export function ProfileCard({ user, onContact, onBook, onReview }: ProfileCardProps) {
  const isCA = user.role === 'ca';

  const avatarSrc = user.profileImage
    ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName)}`;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-4">
        <img
          className="h-16 w-16 rounded-full border-2 border-blue-200 object-cover flex-shrink-0"
          src={avatarSrc}
          alt={user.fullName}
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{user.fullName}</h3>
          {isCA && (
            <div className="flex items-center space-x-2 mt-1 flex-wrap gap-1">
              <Award className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-blue-600 font-medium">Chartered Accountant</span>
              {user.isVerified && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4 flex-1">
        {user.phone && (
          <div className="flex items-center space-x-2 text-gray-600">
            <Phone className="h-4 w-4 flex-shrink-0" />
            <a
              href={`tel:${user.phone}`}
              className="text-sm hover:underline hover:text-blue-600 transition-colors"
            >
              {user.phone}
            </a>
          </div>
        )}

        {isCA && (
          <>
            {user.workExperience != null && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.workExperience} years</span> of experience
              </div>
            )}

            {user.hourlyRate != null && (
              <div className="text-sm text-gray-600">
                ₹<span className="font-medium">{user.hourlyRate.toLocaleString('en-IN')}</span>/hr
              </div>
            )}

            {user.specializations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.specializations.slice(0, 3).map(spec => (
                  <span
                    key={spec}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
                {user.specializations.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.specializations.length - 3} more</span>
                )}
              </div>
            )}

            {/* Rating */}
            <div className="flex items-center space-x-1 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      user.avgRating && i <= Math.floor(user.avgRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              {user.avgRating != null ? (
                <span className="text-sm text-gray-600">
                  {user.avgRating.toFixed(1)}
                  <span className="text-gray-400 ml-1">({user.ratingCount})</span>
                </span>
              ) : (
                <span className="text-sm text-gray-400">No reviews yet</span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onContact(user.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Message</span>
        </button>

        {isCA && onBook && (
          <button
            onClick={() => onBook(user)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Book</span>
          </button>
        )}

        {isCA && onReview && (
          <button
            onClick={() => onReview(user)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-1 text-sm"
          >
            <Star className="h-4 w-4" />
            <span>Review</span>
          </button>
        )}
      </div>
    </div>
  );
}
