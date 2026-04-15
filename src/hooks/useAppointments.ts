import { useState, useCallback } from 'react';
import type { Appointment, ApiResponse } from '../types';
import { api } from '../services/api';

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get<ApiResponse<Appointment[]>>('/appointments');
      setAppointments(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableSlots = useCallback(async (caId: string, date: string): Promise<string[]> => {
    try {
      const res = await api.get<ApiResponse<string[]>>(`/appointments/${caId}/slots?date=${date}`);
      return res.data;
    } catch {
      return [];
    }
  }, []);

  const bookAppointment = useCallback(async (
    caId: string,
    scheduledTime: string,
    durationMinutes = 60
  ): Promise<Appointment | null> => {
    try {
      const res = await api.post<ApiResponse<Appointment>>('/appointments', {
        caId,
        scheduledTime,
        durationMinutes,
      });
      setAppointments(prev => [res.data, ...prev]);
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
      return null;
    }
  }, []);

  const updateAppointment = useCallback(async (
    id: string,
    updates: { status?: string; meetingNotes?: string }
  ): Promise<Appointment | null> => {
    try {
      const res = await api.put<ApiResponse<Appointment>>(`/appointments/${id}`, updates);
      setAppointments(prev =>
        prev.map(a => a.id === id ? res.data : a)
      );
      return res.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      return null;
    }
  }, []);

  return {
    appointments,
    isLoading,
    error,
    fetchAppointments,
    fetchAvailableSlots,
    bookAppointment,
    updateAppointment,
  };
}
