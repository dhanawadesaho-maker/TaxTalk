import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import type { UserSearchFilters } from '../hooks/useUsers';

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

interface SearchFilterProps {
  onSearch: (filters: UserSearchFilters) => void;
  isLoading?: boolean;
}

export function SearchFilter({ onSearch, isLoading }: SearchFilterProps) {
  const [q, setQ] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [minExperience, setMinExperience] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({
      q: q.trim() || undefined,
      specialization: specialization || undefined,
      minRating: minRating > 0 ? minRating : undefined,
      minExperience: minExperience > 0 ? minExperience : undefined,
    });
  };

  const handleReset = () => {
    setQ('');
    setSpecialization('');
    setMinRating(0);
    setMinExperience(0);
    onSearch({});
  };

  const hasActiveFilters = specialization || minRating > 0 || minExperience > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search CAs by name or expertise..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <button
          onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'border-gray-300 text-gray-600 hover:border-gray-400'
          }`}
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white rounded-full h-4 w-4 text-xs flex items-center justify-center">
              !
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Specialization */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
            <select
              value={specialization}
              onChange={e => setSpecialization(e.target.value)}
              className="w-full border border-gray-300 rounded-md text-sm py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All specializations</option>
              {SPECIALIZATION_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Rating: {minRating > 0 ? `${minRating}★` : 'Any'}
            </label>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={e => setMinRating(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Any</span>
              <span>5★</span>
            </div>
          </div>

          {/* Min Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Experience: {minExperience > 0 ? `${minExperience} yrs` : 'Any'}
            </label>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={minExperience}
              onChange={e => setMinExperience(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Any</span>
              <span>20+ yrs</span>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-3 flex justify-end">
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              >
                <X className="h-3.5 w-3.5" />
                Reset filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
