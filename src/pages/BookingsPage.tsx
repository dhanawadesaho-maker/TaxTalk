import React, { useEffect } from 'react';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import { useAuth } from '../contexts/AuthContext';
import type { Appointment } from '../types';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

function AppointmentCard({ appt, role }: { appt: Appointment; role: string }) {
  const counterparty = role === 'ca' ? appt.clientName : appt.caName;
  const date = new Date(appt.scheduledTime);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <span className="font-medium text-gray-900 truncate">{counterparty ?? '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
            <Calendar className="h-4 w-4 flex-shrink-0" />
            <span>
              {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              {' · '}
              {appt.durationMinutes} min
            </span>
          </div>
          {appt.meetingNotes && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{appt.meetingNotes}</p>
          )}
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 capitalize ${STATUS_STYLES[appt.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {appt.status}
        </span>
      </div>
    </div>
  );
}

interface BookingsPageProps {
  onBack: () => void;
}

export function BookingsPage({ onBack }: BookingsPageProps) {
  const { currentUser } = useAuth();
  const { appointments, isLoading, error, fetchAppointments } = useAppointments();

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const past = appointments.filter(a => ['completed', 'cancelled'].includes(a.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900">My Bookings</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 rounded-md px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No bookings yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {currentUser?.role === 'client'
                ? 'Book a session with a CA to get started.'
                : 'Your appointments will appear here once clients book with you.'}
            </p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map(a => (
                    <AppointmentCard key={a.id} appt={a} role={currentUser?.role ?? 'client'} />
                  ))}
                </div>
              </section>
            )}

            {past.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Past ({past.length})
                </h2>
                <div className="space-y-3">
                  {past.map(a => (
                    <AppointmentCard key={a.id} appt={a} role={currentUser?.role ?? 'client'} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
