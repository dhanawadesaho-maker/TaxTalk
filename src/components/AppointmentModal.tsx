import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Loader } from 'lucide-react';
import type { User } from '../types';
import { useAppointments } from '../hooks/useAppointments';

interface AppointmentModalProps {
  ca: User;
  onClose: () => void;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return toLocalDateString(d);
}

export function AppointmentModal({ ca, onClose }: AppointmentModalProps) {
  const [selectedDate, setSelectedDate] = useState(getDateString(1));
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { fetchAvailableSlots, bookAppointment } = useAppointments();

  useEffect(() => {
    setSelectedSlot(null);
    setLoadingSlots(true);
    setError(null);
    fetchAvailableSlots(ca.id, selectedDate)
      .then(setSlots)
      .catch(() => setError('Failed to load available slots'))
      .finally(() => setLoadingSlots(false));
  }, [ca.id, selectedDate, fetchAvailableSlots]);

  const handleBook = async () => {
    if (!selectedSlot) return;
    setBooking(true);
    setError(null);
    const appt = await bookAppointment(ca.id, selectedSlot);
    setBooking(false);
    if (appt) {
      setSuccess(true);
    } else {
      setError('Failed to book appointment. Please try again.');
    }
  };

  // Build a date picker for the next 14 days
  const dateOptions = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return {
      value: toLocalDateString(d),
      label: `${DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`,
      dayOfWeek: d.getDay(),
    };
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Book Appointment</h2>
            <p className="text-sm text-gray-500">with {ca.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Appointment Requested!</h3>
              <p className="text-gray-500 text-sm mb-4">
                Your appointment request has been sent to {ca.fullName}. You'll receive a notification once confirmed.
              </p>
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

              {/* Date picker */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Select Date
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {dateOptions.map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedDate(opt.value)}
                      className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-colors text-center min-w-[56px] ${
                        selectedDate === opt.value
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-200 text-gray-600 hover:border-blue-300'
                      }`}
                    >
                      <div>{opt.label.split(' ')[0]}</div>
                      <div className="font-bold">{opt.label.split(' ')[1]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slots */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Available Time Slots
                </label>

                {loadingSlots ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm py-4">
                    <Loader className="h-4 w-4 animate-spin" />
                    Loading slots...
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-gray-500 text-sm py-3 bg-gray-50 rounded-md text-center">
                    No available slots for this date
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => {
                      const time = new Date(slot).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      });
                      return (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                            selectedSlot === slot
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-200 text-gray-700 hover:border-blue-300'
                          }`}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <button
                onClick={handleBook}
                disabled={!selectedSlot || booking}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2.5 rounded-md font-medium text-sm transition-colors flex items-center justify-center gap-2"
              >
                {booking && <Loader className="h-4 w-4 animate-spin" />}
                {booking ? 'Booking...' : selectedSlot ? 'Confirm Booking' : 'Select a time slot'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
