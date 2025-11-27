import type {
  HistoricalObject,
  Entry,
  CreateObjectRequest,
  CreateEntryRequest,
  UpdateObjectRequest,
  UpdateEntryRequest,
  EntryFilters,
  ApiResponse,
  ApiError,
} from '../types';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Custom error class for API errors
export class ApiClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

// Generic fetch wrapper with error handling
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        error: 'An unknown error occurred',
      }));
      throw new ApiClientError(
        errorData.error || 'Request failed',
        response.status,
        errorData.details
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiClientError) {
      throw error;
    }
    throw new ApiClientError(
      error instanceof Error ? error.message : 'Network error occurred'
    );
  }
}

// Object API methods
export const objectsApi = {
  // Get all objects
  getAll: async (): Promise<HistoricalObject[]> => {
    const response = await apiFetch<ApiResponse<HistoricalObject[]>>('/objects');
    return response.data;
  },

  // Get single object by ID
  getById: async (id: string): Promise<HistoricalObject> => {
    const response = await apiFetch<ApiResponse<HistoricalObject>>(`/objects/${id}`);
    return response.data;
  },

  // Create new object
  create: async (data: CreateObjectRequest): Promise<HistoricalObject> => {
    const response = await apiFetch<ApiResponse<HistoricalObject>>('/objects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update existing object
  update: async (id: string, data: UpdateObjectRequest): Promise<HistoricalObject> => {
    const response = await apiFetch<ApiResponse<HistoricalObject>>(`/objects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete object
  delete: async (id: string): Promise<void> => {
    await apiFetch<ApiResponse<void>>(`/objects/${id}`, {
      method: 'DELETE',
    });
  },
};

// Entry API methods
export const entriesApi = {
  // Get all entries with optional filters
  getAll: async (filters?: EntryFilters): Promise<Entry[]> => {
    const queryParams = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/entries?${queryString}` : '/entries';

    const response = await apiFetch<ApiResponse<Entry[]>>(endpoint);
    return response.data;
  },

  // Get single entry by ID
  getById: async (id: string): Promise<Entry> => {
    const response = await apiFetch<ApiResponse<Entry>>(`/entries/${id}`);
    return response.data;
  },

  // Get entries for a specific object
  getByObjectId: async (objectId: string): Promise<Entry[]> => {
    return entriesApi.getAll({ objectId });
  },

  // Create new entry
  create: async (data: CreateEntryRequest): Promise<Entry> => {
    const response = await apiFetch<ApiResponse<Entry>>('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update existing entry
  update: async (id: string, data: UpdateEntryRequest): Promise<Entry> => {
    const response = await apiFetch<ApiResponse<Entry>>(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Delete entry
  delete: async (id: string): Promise<void> => {
    await apiFetch<ApiResponse<void>>(`/entries/${id}`, {
      method: 'DELETE',
    });
  },
};

// Export a combined API client
export const api = {
  objects: objectsApi,
  entries: entriesApi,
};

export default api;
