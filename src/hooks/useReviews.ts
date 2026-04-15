import { useState, useCallback } from 'react';
import type { Review, ApiResponse } from '../types';
import { api } from '../services/api';

export interface RatingStats {
  avg: number | null;
  count: number;
  distribution: Array<{ rating: number; count: number }>;
}

export function useReviews(caId?: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<RatingStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get<ApiResponse<Review[]>>(`/ratings/${id}`),
        api.get<ApiResponse<RatingStats>>(`/ratings/stats/${id}`),
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitReview = useCallback(async (
    targetCaId: string,
    rating: number,
    reviewText?: string
  ): Promise<boolean> => {
    try {
      await api.post<ApiResponse<Review>>('/ratings', {
        caId: targetCaId,
        rating,
        reviewText,
      });
      // Refresh reviews
      await fetchReviews(targetCaId);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      return false;
    }
  }, [fetchReviews]);

  return { reviews, stats, isLoading, error, fetchReviews, submitReview };
}
