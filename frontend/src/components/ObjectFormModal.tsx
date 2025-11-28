import { useState, useEffect, type FormEvent } from 'react';
import Modal from './Modal';
import FormField from './FormField';
import type { HistoricalObject, CreateObjectRequest, ObjectType } from '../types';

interface ObjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateObjectRequest) => Promise<void>;
  editingObject?: HistoricalObject | null;
}

const OBJECT_TYPES: { value: ObjectType; label: string }[] = [
  { value: 'person', label: 'Person' },
  { value: 'place', label: 'Place' },
  { value: 'artifact', label: 'Artifact' },
  { value: 'event', label: 'Event' },
  { value: 'institution', label: 'Institution' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  name: string;
  type: ObjectType | '';
  description: string;
  imageUrl: string;
}

interface FormErrors {
  name?: string;
  type?: string;
  description?: string;
  imageUrl?: string;
}

export default function ObjectFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingObject,
}: ObjectFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: '',
    description: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  // Initialize form with editing object data
  useEffect(() => {
    if (isOpen) {
      if (editingObject) {
        setFormData({
          name: editingObject.name,
          type: editingObject.type,
          description: editingObject.description,
          imageUrl: editingObject.imageUrl || '',
        });
        setImagePreview(editingObject.imageUrl || '');
      } else {
        setFormData({
          name: '',
          type: '',
          description: '',
          imageUrl: '',
        });
        setImagePreview('');
      }
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, editingObject]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Name must be less than 200 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Must be a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleImageUrlBlur = () => {
    if (formData.imageUrl && isValidUrl(formData.imageUrl)) {
      setImagePreview(formData.imageUrl);
    } else {
      setImagePreview('');
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const submitData: CreateObjectRequest = {
        name: formData.name.trim(),
        type: formData.type as ObjectType,
        description: formData.description.trim(),
        ...(formData.imageUrl && { imageUrl: formData.imageUrl }),
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to save object'
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={editingObject ? 'Edit Historical Object' : 'Create Historical Object'}
      size="md"
      preventClose={isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Banner */}
        {submitError && (
          <div className="bg-colonial-red text-parchment px-4 py-3 rounded">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{submitError}</p>
          </div>
        )}

        {/* Name Field */}
        <FormField label="Name" htmlFor="name" error={errors.name} required>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            onBlur={() => validateForm()}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
            placeholder="e.g., Hernán Cortés"
            autoFocus
            disabled={isSubmitting}
          />
        </FormField>

        {/* Type Field */}
        <FormField label="Type" htmlFor="type" error={errors.type} required>
          <select
            id="type"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as ObjectType })
            }
            onBlur={() => validateForm()}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
            disabled={isSubmitting}
          >
            <option value="">Select type...</option>
            {OBJECT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </FormField>

        {/* Description Field */}
        <FormField
          label="Description"
          htmlFor="description"
          error={errors.description}
          required
        >
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            onBlur={() => validateForm()}
            rows={4}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors resize-y"
            placeholder="Provide a detailed description of this historical object..."
            disabled={isSubmitting}
          />
        </FormField>

        {/* Image URL Field */}
        <FormField
          label="Image URL (optional)"
          htmlFor="imageUrl"
          error={errors.imageUrl}
        >
          <input
            type="text"
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            onBlur={handleImageUrlBlur}
            className="w-full px-3 py-2 border-2 border-map-border rounded bg-parchment text-ink-black focus:outline-none focus:border-colonial-blue transition-colors"
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
          />
        </FormField>

        {/* Image Preview */}
        {imagePreview && (
          <div className="border-2 border-map-border rounded p-2">
            <p className="text-sm text-aged-ink mb-2">Image Preview:</p>
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded"
              onError={() => setImagePreview('')}
            />
          </div>
        )}

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
              : editingObject
              ? 'Update Object'
              : 'Create Object'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
