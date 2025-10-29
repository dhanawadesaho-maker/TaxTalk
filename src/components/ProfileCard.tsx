import React from 'react';
import { Star, Phone, Award, MessageCircle } from 'lucide-react';
import { User } from '../types';

interface ProfileCardProps {
  user: User;
  onContact: (userId: string) => void;
}

export function ProfileCard({ user, onContact }: ProfileCardProps) {
  const isCA = user.userType === 'ca';

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200">
      <div className="flex items-center space-x-4 mb-4">
        <img
          className="h-16 w-16 rounded-full border-2 border-blue-200"
          src={user.profileImage}
          alt={user.name}
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          {isCA && (
            <div className="flex items-center space-x-2 mt-1">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">Chartered Accountant</span>
              {user.isVerified && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Verified
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="h-4 w-4" />
          <span className="text-sm">{user.phone}</span>
        </div>

        {isCA && (
          <>
            {user.workExperience && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.workExperience} years</span> of experience
              </div>
            )}
            
            {user.specialization && user.specialization.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {user.specialization.slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                  >
                    {spec}
                  </span>
                ))}
                {user.specialization.length > 3 && (
                  <span className="text-xs text-gray-500">+{user.specialization.length - 3} more</span>
                )}
              </div>
            )}

            {user.rating && (
              <div className="flex items-center space-x-1 mt-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(user.rating!)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">{user.rating.toFixed(1)}</span>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => onContact(user.id)}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center space-x-2"
      >
        <MessageCircle className="h-4 w-4" />
        <span>Contact</span>
      </button>
    </div>
  );
}