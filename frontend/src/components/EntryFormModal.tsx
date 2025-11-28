import { useState, useEffect, type FormEvent } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import TagInput from './TagInput';
import LocationPicker from './LocationPicker';
import type { Entry, CreateEntryRequest, HistoricalObject } from '../types';

interface EntryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEntryRequest) => Promise<void>;
  editingEntry?: Entry | null;
  availableObjects: HistoricalObject[];
}

interface FormData {
  objectId: string;
  latitude: string;
  longitude: string;
  locationName: string;
  startDate: string;
  endDate: string;
  description: string;
  sources: string[];
  tags: string[];
}

interface FormErrors {
  objectId?: string;
  latitude?: string;
  longitude?: string;
  locationName?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export default function EntryFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingEntry,
  availableObjects,
}: EntryFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    objectId: '',
    latitude: '',
    longitude: '',
    locationName: '',
    startDate: '',
    endDate: '',
    description: '',
    sources: [],
    tags: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [objectSearch, setObjectSearch] = useState('');

  // Initialize form with editing entry data
  useEffect(() => {
    if (isOpen) {
      if (editingEntry) {
        setFormData({
          objectId: editingEntry.objectId,
          latitude: editingEntry.location.latitude.toString(),
          longitude: editingEntry.location.longitude.toString(),
          locationName: editingEntry.locationName,
          startDate: editingEntry.startDate.split('T')[0], // Convert ISO to date input format
          endDate: editingEntry.endDate ? editingEntry.endDate.split('T')[0] : '',
          description: editingEntry.description,
          sources: editingEntry.sources,
          tags: editingEntry.tags,
        });
        const obj = availableObjects.find((o) => o.id === editingEntry.objectId);
        setObjectSearch(obj?.name || '');
      } else {
        setFormData({
          objectId: '',
          latitude: '',
          longitude: '',
          locationName: '',
          startDate: '',
          endDate: '',
          description: '',
          sources: [],
          tags: [],
        });
        setObjectSearch('');
      }
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, editingEntry, availableObjects]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.objectId) {
      newErrors.objectId = 'Historical object is required';
    }

    const lat = parseFloat(formData.latitude);
    if (!formData.latitude) {
      newErrors.latitude = 'Latitude is required';
    } else if (isNaN(lat) || lat < -90 || lat > 90) {
      newErrors.latitude = 'Latitude must be between -90 and 90';
    }

    const lng = parseFloat(formData.longitude);
    if (!formData.longitude) {
      newErrors.longitude = 'Longitude is required';
    } else if (isNaN(lng) || lng < -180 || lng > 180) {
      newErrors.longitude = 'Longitude must be between -180 and 180';
    }

    if (!formData.locationName.trim()) {
      newErrors.locationName = 'Location name is required';
    } else if (formData.locationName.length > 200) {
      newErrors.locationName = 'Location name must be less than 200 characters';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const submitData: CreateEntryRequest = {
        objectId: formData.objectId,
        location: {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        },
        locationName: formData.locationName.trim(),
        startDate: new Date(formData.startDate).toISOString(),
        ...(formData.endDate && { endDate: new Date(formData.endDate).toISOString() }),
        description: formData.description.trim(),
        sources: formData.sources,
        tags: formData.tags,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save entry'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  // Filter objects based on search
  const filteredObjects = availableObjects.filter((obj) =>
    obj.name.toLowerCase().includes(objectSearch.toLowerCase())
  );

  const handleObjectSelect = (objectId: string) => {
    const obj = availableObjects.find((o) => o.id === objectId);
    if (obj) {
      setFormData({ ...formData, objectId });
      setObjectSearch(obj.name);
    }
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData({
      ...formData,
      latitude: lat.toFixed(4),
      longitude: lng.toFixed(4),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingEntry ? 'Edit Historical Entry' : 'Create Historical Entry'}
      size="xl"
      preventClose={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 h-full">
        {/* Left Column - Form Fields */}
        <div className="space-y-4 overflow-y-auto pr-4">
        {/* Error Banner */}
        {submitError && (
          <div className="bg-colonial-red text-parchment px-4 py-3 rounded">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Historical Object Field */}
        <FormField
          label="Historical Object"
          htmlFor="objectId"
          error={errors.objectId}
          required
        >
          <div className="relative">
            <input
              type="text"
              id="objectSearch"
              value={objectSearch}
              onChange={(e) => {
                setObjectSearch(e.target.value);
                setFormData({ ...formData, objectId: '' });
              }}
              placeholder="Search for an object..."
              className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
              disabled={isSubmitting}
              autoFocus
            />
            {objectSearch && !formData.objectId && filteredObjects.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-parchment border-2 border-map-border rounded shadow-lg max-h-60 overflow-y-auto">
                {filteredObjects.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => handleObjectSelect(obj.id)}
                    className="w-full px-3 py-2 text-left hover:bg-aged-paper transition-colors flex items-center justify-between"
                  >
                    <span className="text-ink-black">{obj.name}</span>
                    <span className="text-xs bg-colonial-blue text-parchment px-2 py-1 rounded">
                      {obj.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {objectSearch && !formData.objectId && filteredObjects.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-parchment border-2 border-map-border rounded shadow-lg px-3 py-2">
                <p className="text-sm text-aged-ink">No objects found</p>
              </div>
            )}
          </div>
        </FormField>

        {/* Location Coordinates */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Latitude" htmlFor="latitude" error={errors.latitude} required>
            <input
              type="number"
              id="latitude"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              onBlur={() => validateForm()}
              step="0.0001"
              min="-90"
              max="90"
              className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
              placeholder="e.g., 19.4326"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Longitude" htmlFor="longitude" error={errors.longitude} required>
            <input
              type="number"
              id="longitude"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              onBlur={() => validateForm()}
              step="0.0001"
              min="-180"
              max="180"
              className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
              placeholder="e.g., -99.1332"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Location Name */}
        <FormField
          label="Location Name"
          htmlFor="locationName"
          error={errors.locationName}
          required
        >
          <input
            type="text"
            id="locationName"
            value={formData.locationName}
            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
            onBlur={() => validateForm()}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
            placeholder="e.g., Mexico City, New Spain"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Dates */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Start Date" htmlFor="startDate" error={errors.startDate} required>
            <input
              type="date"
              id="startDate"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              onBlur={() => validateForm()}
              className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="End Date (optional)" htmlFor="endDate" error={errors.endDate}>
            <input
              type="date"
              id="endDate"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              onBlur={() => validateForm()}
              className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Description */}
        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description}
          required
        >
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            onBlur={() => validateForm()}
            rows={4}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors resize-y"
            placeholder="Describe this historical entry..."
            disabled={isSubmitting}
          />
        </FormField>

        {/* Sources */}
        <FormField label="Sources (optional)" htmlFor="sources">
          <TagInput
            tags={formData.sources}
            onChange={(sources) => setFormData({ ...formData, sources })}
            placeholder="Add source citation..."
          />
        </FormField>

        {/* Tags */}
        <FormField label="Tags (optional)" htmlFor="tags">
          <TagInput
            tags={formData.tags}
            onChange={(tags) => setFormData({ ...formData, tags })}
            placeholder="Add tag..."
          />
        </FormField>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-aged-paper text-ink-black border-2 border-map-border rounded hover:bg-parchment transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-colonial-blue text-parchment rounded hover:bg-colonial-brown transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            {isSubmitting
              ? 'Saving...'
              : editingEntry
              ? 'Update Entry'
              : 'Create Entry'}
          </button>
        </div>
        </div>

        {/* Right Column - Interactive Map */}
        <div className="h-[600px] flex flex-col">
          <div className="mb-2">
            <p className="text-sm font-semibold text-colonial-brown">
              Select Location on Map
            </p>
            <p className="text-xs text-aged-ink">
              Click or drag the pin to set the location
            </p>
          </div>
          <div className="flex-1 border-2 border-map-border rounded overflow-hidden">
            <LocationPicker
              latitude={formData.latitude ? parseFloat(formData.latitude) : null}
              longitude={formData.longitude ? parseFloat(formData.longitude) : null}
              onLocationChange={handleLocationChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
