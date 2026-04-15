import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  User,
  Phone,
  DollarSign,
  FileText,
  Clock,
  Award,
  CheckSquare,
  Square,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { AvailabilitySlot, ApiResponse } from '../types';

// ─── Constants ───────────────────────────────────────────────────────────────

const SPECIALIZATION_OPTIONS = [
  'Income Tax',
  'GST',
  'Auditing',
  'Corporate Law',
  'TDS',
  'Financial Planning',
  'Company Law',
  'International Taxation',
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIMES = { startTime: '09:00', endTime: '18:00' };

// ─── Types ────────────────────────────────────────────────────────────────────

interface SlotDraft {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

interface ProfileDraft {
  fullName: string;
  phone: string;
  bio: string;
  hourlyRate: string;
  caNumber: string;
  workExperience: string;
}

interface Props {
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultSlots(): SlotDraft[] {
  return DAYS.map((_, dayOfWeek) => ({
    dayOfWeek,
    startTime: DEFAULT_TIMES.startTime,
    endTime: DEFAULT_TIMES.endTime,
    isActive: dayOfWeek >= 1 && dayOfWeek <= 5, // Mon–Fri active by default
  }));
}

function slotsFromApi(apiSlots: AvailabilitySlot[]): SlotDraft[] {
  const base = buildDefaultSlots();
  return base.map(draft => {
    const found = apiSlots.find(s => s.dayOfWeek === draft.dayOfWeek);
    if (found) {
      return {
        dayOfWeek: found.dayOfWeek,
        startTime: found.startTime.slice(0, 5),
        endTime: found.endTime.slice(0, 5),
        isActive: found.isActive,
      };
    }
    return draft;
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CAProfileEdit({ onClose }: Props) {
  const { currentUser, updateCurrentUser } = useAuth();

  const [profile, setProfile] = useState<ProfileDraft>({
    fullName: currentUser?.fullName ?? '',
    phone: currentUser?.phone ?? '',
    bio: currentUser?.bio ?? '',
    hourlyRate: currentUser?.hourlyRate?.toString() ?? '',
    caNumber: currentUser?.caNumber ?? '',
    workExperience: currentUser?.workExperience?.toString() ?? '',
  });

  const [specializations, setSpecializations] = useState<string[]>(
    currentUser?.specializations ?? []
  );

  const [slots, setSlots] = useState<SlotDraft[]>(buildDefaultSlots());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load existing availability slots
  useEffect(() => {
    if (!currentUser) return;
    api
      .get<ApiResponse<AvailabilitySlot[]>>(`/availability/${currentUser.id}`)
      .then(res => {
        if (res.success && res.data.length > 0) {
          setSlots(slotsFromApi(res.data));
        }
      })
      .catch(() => null); // silently ignore; default slots are fine
  }, [currentUser]);

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleProfileChange = (field: keyof ProfileDraft, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const toggleSpecialization = (spec: string) => {
    setSpecializations(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  const updateSlot = (dayOfWeek: number, field: keyof SlotDraft, value: string | boolean) => {
    setSlots(prev =>
      prev.map(slot =>
        slot.dayOfWeek === dayOfWeek ? { ...slot, [field]: value } : slot
      )
    );
  };

  // ─── Save ─────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!currentUser) return;
    setError(null);
    setSaving(true);

    try {
      // 1. Update profile
      const profilePayload: Record<string, unknown> = {
        fullName: profile.fullName.trim(),
        phone: profile.phone.trim() || null,
        bio: profile.bio.trim() || null,
        hourlyRate: profile.hourlyRate ? parseInt(profile.hourlyRate, 10) : null,
        caNumber: profile.caNumber.trim() || null,
        workExperience: profile.workExperience ? parseInt(profile.workExperience, 10) : null,
      };

      const userRes = await api.put<ApiResponse<{ user: typeof currentUser }>>(
        `/users/${currentUser.id}`,
        profilePayload
      );

      // 2. Sync specializations: remove all then add current selection
      const existing = currentUser.specializations ?? [];
      const toRemove = existing.filter(s => !specializations.includes(s));
      const toAdd = specializations.filter(s => !existing.includes(s));

      await Promise.all([
        ...toRemove.map(spec =>
          api.delete(`/users/${currentUser.id}/specializations/${encodeURIComponent(spec)}`)
        ),
        ...toAdd.map(spec =>
          api.post(`/users/${currentUser.id}/specializations`, { specialization: spec })
        ),
      ]);

      // 3. Update availability slots
      const activeSlots = slots.filter(s => s.isActive).map(s => ({
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
      }));
      await api.put(`/availability/${currentUser.id}`, { slots: activeSlots });

      // 4. Update auth context
      if (userRes.success) {
        updateCurrentUser({
          ...currentUser,
          ...profilePayload,
          specializations,
          hourlyRate: profilePayload.hourlyRate as number | null,
          workExperience: profilePayload.workExperience as number | null,
        });
      }

      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-7">
          {/* Error / success banners */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-lg">
              Profile saved successfully!
            </div>
          )}

          {/* Basic Info */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" icon={<User className="h-4 w-4 text-gray-400" />}>
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={e => handleProfileChange('fullName', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Phone" icon={<Phone className="h-4 w-4 text-gray-400" />}>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={e => handleProfileChange('phone', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+91 98765 43210"
                />
              </Field>
              <Field label="CA Membership No." icon={<Award className="h-4 w-4 text-gray-400" />}>
                <input
                  type="text"
                  value={profile.caNumber}
                  onChange={e => handleProfileChange('caNumber', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="CA123456"
                />
              </Field>
              <Field
                label="Experience (years)"
                icon={<Clock className="h-4 w-4 text-gray-400" />}
              >
                <input
                  type="number"
                  min="0"
                  value={profile.workExperience}
                  onChange={e => handleProfileChange('workExperience', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 8"
                />
              </Field>
              <Field
                label="Hourly Rate (₹)"
                icon={<DollarSign className="h-4 w-4 text-gray-400" />}
              >
                <input
                  type="number"
                  min="0"
                  value={profile.hourlyRate}
                  onChange={e => handleProfileChange('hourlyRate', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. 2000"
                />
              </Field>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-gray-400" />
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={e => handleProfileChange('bio', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder="Tell clients about your expertise and experience..."
              />
            </div>
          </section>

          {/* Specializations */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
              Specializations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SPECIALIZATION_OPTIONS.map(spec => {
                const active = specializations.includes(spec);
                return (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => toggleSpecialization(spec)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                      active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {active ? (
                      <CheckSquare className="h-4 w-4 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0 text-gray-400" />
                    )}
                    <span className="leading-tight">{spec}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Weekly Availability */}
          <section>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
              Weekly Availability
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              Set the days and hours when clients can book appointments.
            </p>
            <div className="space-y-2">
              {slots.map(slot => (
                <div
                  key={slot.dayOfWeek}
                  className={`flex flex-wrap sm:flex-nowrap items-center gap-3 p-3 rounded-lg border transition-colors ${
                    slot.isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  {/* Day toggle */}
                  <button
                    type="button"
                    onClick={() => updateSlot(slot.dayOfWeek, 'isActive', !slot.isActive)}
                    className={`flex items-center gap-2 min-w-[120px] text-sm font-medium transition-colors ${
                      slot.isActive ? 'text-blue-700' : 'text-gray-400'
                    }`}
                  >
                    {slot.isActive ? (
                      <CheckSquare className="h-4 w-4 shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 shrink-0" />
                    )}
                    {DAYS[slot.dayOfWeek]}
                  </button>

                  {/* Time pickers */}
                  {slot.isActive && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={e => updateSlot(slot.dayOfWeek, 'startTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="text-xs text-gray-500">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={e => updateSlot(slot.dayOfWeek, 'endTime', e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  )}
                  {!slot.isActive && (
                    <span className="text-xs text-gray-400 italic">Unavailable</span>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || success}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium transition-colors"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
