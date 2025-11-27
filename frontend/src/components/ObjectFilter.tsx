import { useState } from 'react';
import type { EntryFilters, ObjectType } from '../types';

interface ObjectFilterProps {
  onFilterChange: (filters: EntryFilters) => void;
  availableTags?: string[];
}

const OBJECT_TYPES: ObjectType[] = [
  'person',
  'place',
  'artifact',
  'event',
  'institution',
  'other',
];

export default function ObjectFilter({
  onFilterChange,
  availableTags = [],
}: ObjectFilterProps) {
  const [filters, setFilters] = useState<EntryFilters>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleTypeChange = (type: ObjectType) => {
    const newFilters = {
      ...filters,
      objectType: filters.objectType === type ? undefined : type,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearchChange = (search: string) => {
    const newFilters = {
      ...filters,
      search: search.trim() || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStartDateChange = (date: string) => {
    const newFilters = {
      ...filters,
      startDate: date || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleEndDateChange = (date: string) => {
    const newFilters = {
      ...filters,
      endDate: date || undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    const newFilters = {
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof EntryFilters] !== undefined
  );

  return (
    <div className="bg-parchment border-2 border-map-border rounded-lg shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-map-border">
        <h2 className="text-lg font-serif font-bold text-colonial-brown">
          Filters
        </h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-colonial-red hover:underline"
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-aged-ink hover:text-colonial-brown transition-colors"
            aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
          >
            <svg
              className={`w-5 h-5 transform transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-semibold text-colonial-brown mb-2"
            >
              Search
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search entries..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full px-3 py-2 border-2 border-map-border rounded focus:outline-none focus:border-colonial-brown bg-aged-paper"
            />
          </div>

          {/* Object Type */}
          <div>
            <label className="block text-sm font-semibold text-colonial-brown mb-2">
              Object Type
            </label>
            <div className="flex flex-wrap gap-2">
              {OBJECT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-3 py-1 rounded border-2 transition-colors text-sm ${
                    filters.objectType === type
                      ? 'bg-colonial-blue text-parchment border-colonial-blue'
                      : 'bg-aged-paper text-colonial-brown border-map-border hover:border-colonial-brown'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-semibold text-colonial-brown mb-2">
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="startDate" className="block text-xs text-aged-ink mb-1">
                  From
                </label>
                <input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full px-2 py-1 border-2 border-map-border rounded focus:outline-none focus:border-colonial-brown bg-aged-paper text-sm"
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-xs text-aged-ink mb-1">
                  To
                </label>
                <input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full px-2 py-1 border-2 border-map-border rounded focus:outline-none focus:border-colonial-brown bg-aged-paper text-sm"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          {availableTags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-colonial-brown mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const isSelected = filters.tags?.includes(tag) || false;
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        isSelected
                          ? 'bg-colonial-blue text-parchment'
                          : 'bg-aged-paper text-colonial-brown hover:bg-colonial-blue hover:text-parchment'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
