import React, { useState } from 'react';
import { X, Star, Loader } from 'lucide-react';
import type { User } from '../types';
import { useReviews } from '../hooks/useReviews';

interface ReviewModalProps {
  ca: User;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewModal({ ca, onClose, onSubmitted }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { submitReview } = useReviews();

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    setSubmitting(true);
    setError(null);
    const ok = await submitReview(ca.id, rating, reviewText.trim() || undefined);
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      onSubmitted?.();
    } else {
      setError('Failed to submit review. You may have already reviewed this CA.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Write a Review</h2>
            <p className="text-sm text-gray-500">for {ca.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    className={`h-8 w-8 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Submitted!</h3>
              <p className="text-gray-500 text-sm mb-4">Thank you for your feedback.</p>
              <button
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-md px-3 py-2 text-sm mb-4">
                  {error}
                </div>
              )}

              {/* Star rating */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onMouseEnter={() => setHovered(i)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(i)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          i <= (hovered || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-gray-600 self-center">
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Review text */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="Share your experience with this CA..."
                  className="w-full border border-gray-300 rounded-md text-sm px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">{reviewText.length}/500</p>
              </div>

              <button
                onClick={handleSubmit}
                disabled={rating === 0 || submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {submitting && <Loader className="h-4 w-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
