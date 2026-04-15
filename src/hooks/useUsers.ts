import { useState, useCallback } from 'react';
import type { User, ApiResponse } from '../types';
import { api } from '../services/api';

export interface UserSearchFilters {
  q?: string;
  specialization?: string;
  minRating?: number;
  minExperience?: number;
  page?: number;
  limit?: number;
}

interface SearchResult {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number } | null>(null);

  const searchUsers = useCallback(async (filters: UserSearchFilters = {}): Promise<SearchResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.specialization) params.set('specialization', filters.specialization);
      if (filters.minRating != null) params.set('minRating', String(filters.minRating));
      if (filters.minExperience != null) params.set('minExperience', String(filters.minExperience));
      if (filters.page != null) params.set('page', String(filters.page));
      if (filters.limit != null) params.set('limit', String(filters.limit));

      const qs = params.toString();
      const res = await api.get<ApiResponse<User[]>>(`/users/search${qs ? `?${qs}` : ''}`);

      const newUsers = res.data;
      const newMeta = res.meta ?? { total: newUsers.length, page: 1, limit: 20 };

      setUsers(newUsers);
      setMeta(newMeta);

      return { users: newUsers, ...newMeta };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load users';
      setError(msg);
      return { users: [], total: 0, page: 1, limit: 20 };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (id: string): Promise<User | null> => {
    try {
      const res = await api.get<ApiResponse<User>>(`/users/${id}`);
      return res.data;
    } catch {
      return null;
    }
  }, []);

  return { users, isLoading, error, meta, searchUsers, getUserById };
}
