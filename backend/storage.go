package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
	"time"
)

const dataFile = "data.json"

// Storage handles thread-safe JSON file operations
type Storage struct {
	mu   sync.RWMutex
	data DataStore
}

// NewStorage creates a new Storage instance and loads data from file
func NewStorage() (*Storage, error) {
	s := &Storage{}
	if err := s.load(); err != nil {
		return nil, err
	}
	return s, nil
}

// load reads the JSON file into memory
func (s *Storage) load() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	data, err := os.ReadFile(dataFile)
	if err != nil {
		if os.IsNotExist(err) {
			// Initialize with empty data if file doesn't exist
			s.data = DataStore{
				Objects: []HistoricalObject{},
				Entries: []Entry{},
			}
			return s.save()
		}
		return fmt.Errorf("failed to read data file: %w", err)
	}

	if err := json.Unmarshal(data, &s.data); err != nil {
		return fmt.Errorf("failed to parse data file: %w", err)
	}

	return nil
}

// save writes the current data to the JSON file
func (s *Storage) save() error {
	data, err := json.MarshalIndent(s.data, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	if err := os.WriteFile(dataFile, data, 0644); err != nil {
		return fmt.Errorf("failed to write data file: %w", err)
	}

	return nil
}

// getCurrentTimestamp returns ISO 8601 formatted timestamp
func getCurrentTimestamp() string {
	return time.Now().UTC().Format(time.RFC3339)
}

// GetAllObjects returns all objects
func (s *Storage) GetAllObjects() []HistoricalObject {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy to prevent external modification
	objects := make([]HistoricalObject, len(s.data.Objects))
	copy(objects, s.data.Objects)
	return objects
}

// GetObjectByID returns a specific object by ID
func (s *Storage) GetObjectByID(id string) (*HistoricalObject, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, obj := range s.data.Objects {
		if obj.ID == id {
			// Return a copy
			objCopy := obj
			return &objCopy, nil
		}
	}

	return nil, fmt.Errorf("object not found")
}

// CreateObject adds a new object to the data store
func (s *Storage) CreateObject(obj HistoricalObject) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if ID already exists
	for _, existing := range s.data.Objects {
		if existing.ID == obj.ID {
			return fmt.Errorf("object with ID %s already exists", obj.ID)
		}
	}

	s.data.Objects = append(s.data.Objects, obj)
	return s.save()
}

// UpdateObject updates an existing object with partial fields
func (s *Storage) UpdateObject(id string, updates UpdateObjectRequest) (*HistoricalObject, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, obj := range s.data.Objects {
		if obj.ID == id {
			// Apply updates
			if updates.Name != nil {
				s.data.Objects[i].Name = *updates.Name
			}
			if updates.Type != nil {
				s.data.Objects[i].Type = *updates.Type
			}
			if updates.Description != nil {
				s.data.Objects[i].Description = *updates.Description
			}
			if updates.ImageURL != nil {
				s.data.Objects[i].ImageURL = updates.ImageURL
			}

			// Update timestamp
			s.data.Objects[i].UpdatedAt = getCurrentTimestamp()

			if err := s.save(); err != nil {
				return nil, err
			}

			// Return updated object
			updated := s.data.Objects[i]
			return &updated, nil
		}
	}

	return nil, fmt.Errorf("object not found")
}

// DeleteObject removes an object and all its entries (cascade delete)
func (s *Storage) DeleteObject(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	objectIndex := -1
	var entryIDs []string

	// Find object and get entry IDs
	for i, obj := range s.data.Objects {
		if obj.ID == id {
			objectIndex = i
			entryIDs = obj.EntryIDs
			break
		}
	}

	if objectIndex == -1 {
		return fmt.Errorf("object not found")
	}

	// Delete all entries associated with this object
	for _, entryID := range entryIDs {
		s.data.Entries = removeEntryFromSlice(s.data.Entries, entryID)
	}

	// Delete the object
	s.data.Objects = append(s.data.Objects[:objectIndex], s.data.Objects[objectIndex+1:]...)

	return s.save()
}

// GetAllEntries returns all entries from the top-level entries array
func (s *Storage) GetAllEntries() []Entry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy to prevent external modification
	entries := make([]Entry, len(s.data.Entries))
	copy(entries, s.data.Entries)
	return entries
}

// GetEntryByID returns a specific entry by ID
func (s *Storage) GetEntryByID(id string) (*Entry, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	for _, entry := range s.data.Entries {
		if entry.ID == id {
			// Return a copy
			entryCopy := entry
			return &entryCopy, nil
		}
	}

	return nil, fmt.Errorf("entry not found")
}

// GetEntriesByObjectID returns all entries for a specific object
func (s *Storage) GetEntriesByObjectID(objectID string) []Entry {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var entries []Entry
	for _, entry := range s.data.Entries {
		if entry.ObjectID == objectID {
			entries = append(entries, entry)
		}
	}

	return entries
}

// CreateEntry adds a new entry and updates the object's entryIds
func (s *Storage) CreateEntry(entry Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Verify object exists
	objectIndex := -1
	for i, obj := range s.data.Objects {
		if obj.ID == entry.ObjectID {
			objectIndex = i
			break
		}
	}

	if objectIndex == -1 {
		return fmt.Errorf("object not found")
	}

	// Check if entry ID already exists
	for _, existing := range s.data.Entries {
		if existing.ID == entry.ID {
			return fmt.Errorf("entry with ID %s already exists", entry.ID)
		}
	}

	// Add entry to top-level entries
	s.data.Entries = append(s.data.Entries, entry)

	// Add entry ID to object's entryIds
	s.data.Objects[objectIndex].EntryIDs = append(s.data.Objects[objectIndex].EntryIDs, entry.ID)
	s.data.Objects[objectIndex].UpdatedAt = getCurrentTimestamp()

	return s.save()
}

// UpdateEntry updates an existing entry with partial fields
func (s *Storage) UpdateEntry(id string, updates UpdateEntryRequest) (*Entry, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entryIndex := -1
	for i, entry := range s.data.Entries {
		if entry.ID == id {
			entryIndex = i
			break
		}
	}

	if entryIndex == -1 {
		return nil, fmt.Errorf("entry not found")
	}

	oldObjectID := s.data.Entries[entryIndex].ObjectID

	// If objectID is being changed, handle the move
	if updates.ObjectID != nil && *updates.ObjectID != oldObjectID {
		// Verify new object exists
		newObjectExists := false
		newObjectIndex := -1
		for i, obj := range s.data.Objects {
			if obj.ID == *updates.ObjectID {
				newObjectExists = true
				newObjectIndex = i
				break
			}
		}

		if !newObjectExists {
			return nil, fmt.Errorf("new object not found")
		}

		// Remove entry ID from old object
		oldObjectIndex := -1
		for i, obj := range s.data.Objects {
			if obj.ID == oldObjectID {
				oldObjectIndex = i
				break
			}
		}

		if oldObjectIndex != -1 {
			s.data.Objects[oldObjectIndex].EntryIDs = removeStringFromSlice(s.data.Objects[oldObjectIndex].EntryIDs, id)
			s.data.Objects[oldObjectIndex].UpdatedAt = getCurrentTimestamp()
		}

		// Add entry ID to new object
		s.data.Objects[newObjectIndex].EntryIDs = append(s.data.Objects[newObjectIndex].EntryIDs, id)
		s.data.Objects[newObjectIndex].UpdatedAt = getCurrentTimestamp()

		// Update the entry's objectID
		s.data.Entries[entryIndex].ObjectID = *updates.ObjectID
	}

	// Apply other updates
	if updates.Location != nil {
		s.data.Entries[entryIndex].Location = *updates.Location
	}
	if updates.LocationName != nil {
		s.data.Entries[entryIndex].LocationName = *updates.LocationName
	}
	if updates.StartDate != nil {
		s.data.Entries[entryIndex].StartDate = *updates.StartDate
	}
	if updates.EndDate != nil {
		s.data.Entries[entryIndex].EndDate = updates.EndDate
	}
	if updates.Description != nil {
		s.data.Entries[entryIndex].Description = *updates.Description
	}
	if updates.Sources != nil {
		s.data.Entries[entryIndex].Sources = updates.Sources
	}
	if updates.Tags != nil {
		s.data.Entries[entryIndex].Tags = updates.Tags
	}

	// Update timestamp
	s.data.Entries[entryIndex].UpdatedAt = getCurrentTimestamp()

	if err := s.save(); err != nil {
		return nil, err
	}

	// Return updated entry
	updated := s.data.Entries[entryIndex]
	return &updated, nil
}

// DeleteEntry removes an entry and updates the object's entryIds
func (s *Storage) DeleteEntry(id string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	entryIndex := -1
	var objectID string

	// Find entry and get its objectID
	for i, entry := range s.data.Entries {
		if entry.ID == id {
			entryIndex = i
			objectID = entry.ObjectID
			break
		}
	}

	if entryIndex == -1 {
		return fmt.Errorf("entry not found")
	}

	// Remove entry from entries array
	s.data.Entries = append(s.data.Entries[:entryIndex], s.data.Entries[entryIndex+1:]...)

	// Remove entry ID from object's entryIds
	for i, obj := range s.data.Objects {
		if obj.ID == objectID {
			s.data.Objects[i].EntryIDs = removeStringFromSlice(s.data.Objects[i].EntryIDs, id)
			s.data.Objects[i].UpdatedAt = getCurrentTimestamp()
			break
		}
	}

	return s.save()
}

// Helper function to remove a string from a slice
func removeStringFromSlice(slice []string, item string) []string {
	for i, v := range slice {
		if v == item {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}

// Helper function to remove an entry from a slice by ID
func removeEntryFromSlice(slice []Entry, id string) []Entry {
	for i, entry := range slice {
		if entry.ID == id {
			return append(slice[:i], slice[i+1:]...)
		}
	}
	return slice
}
