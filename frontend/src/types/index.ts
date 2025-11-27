// Location coordinates for mapping
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Historical object or figure
export interface HistoricalObject {
  id: string;
  name: string;
  type: ObjectType;
  description: string;
  imageUrl?: string;
  entryIds: string[]; // List of related entry IDs for bidirectional lookup
  createdAt: string;
  updatedAt: string;
}

// Types of historical objects
export type ObjectType =
  | 'person'
  | 'place'
  | 'artifact'
  | 'event'
  | 'institution'
  | 'other';

// Entry represents a specific instance of an object at a location and time
export interface Entry {
  id: string;
  objectId: string;
  object?: HistoricalObject; // Populated object data
  location: Coordinates;
  locationName: string;
  startDate: string; // ISO date string
  endDate?: string; // ISO date string, optional for ongoing or unknown end
  description: string;
  sources: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// Request/Response types for API
export interface CreateObjectRequest {
  name: string;
  type: ObjectType;
  description: string;
  imageUrl?: string;
}

export interface CreateEntryRequest {
  objectId: string;
  location: Coordinates;
  locationName: string;
  startDate: string;
  endDate?: string;
  description: string;
  sources: string[];
  tags: string[];
}

export interface UpdateObjectRequest extends Partial<CreateObjectRequest> {}

export interface UpdateEntryRequest extends Partial<CreateEntryRequest> {}

// Filter options for querying entries
export interface EntryFilters {
  objectId?: string;
  objectType?: ObjectType;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  search?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: string;
}
