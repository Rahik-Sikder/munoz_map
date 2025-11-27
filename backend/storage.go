package main

import (
	"encoding/json"
	"fmt"
	"os"
	"sync"
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
			s.data = DataStore{Objects: []Object{}}
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

// GetAllObjects returns all objects with their entries
func (s *Storage) GetAllObjects() []Object {
	s.mu.RLock()
	defer s.mu.RUnlock()

	// Return a copy to prevent external modification
	objects := make([]Object, len(s.data.Objects))
	copy(objects, s.data.Objects)
	return objects
}

// GetObjectByID returns a specific object by ID
func (s *Storage) GetObjectByID(id string) (*Object, error) {
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
func (s *Storage) CreateObject(obj Object) error {
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

// AddEntry adds a new entry to an existing object
func (s *Storage) AddEntry(objectID string, entry Entry) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	for i, obj := range s.data.Objects {
		if obj.ID == objectID {
			// Check if entry ID already exists
			for _, existing := range obj.Entries {
				if existing.ID == entry.ID {
					return fmt.Errorf("entry with ID %s already exists", entry.ID)
				}
			}

			s.data.Objects[i].Entries = append(s.data.Objects[i].Entries, entry)
			return s.save()
		}
	}

	return fmt.Errorf("object not found")
}
