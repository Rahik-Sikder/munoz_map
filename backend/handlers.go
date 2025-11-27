package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// Server holds the storage and provides HTTP handlers
type Server struct {
	storage *Storage
}

// NewServer creates a new Server instance
func NewServer(storage *Storage) *Server {
	return &Server{storage: storage}
}

// GetAllObjects handles GET /api/objects
func (s *Server) GetAllObjects(w http.ResponseWriter, r *http.Request) {
	objects := s.storage.GetAllObjects()
	respondWithJSON(w, http.StatusOK, objects)
}

// GetObjectByID handles GET /api/objects/:id
func (s *Server) GetObjectByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing object ID")
		return
	}

	object, err := s.storage.GetObjectByID(id)
	if err != nil {
		log.Printf("Error getting object %s: %v", id, err)
		respondWithError(w, http.StatusNotFound, "Object not found")
		return
	}

	respondWithJSON(w, http.StatusOK, object)
}

// CreateObject handles POST /api/objects
func (s *Server) CreateObject(w http.ResponseWriter, r *http.Request) {
	var req CreateObjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding create object request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" {
		respondWithError(w, http.StatusBadRequest, "Name is required")
		return
	}
	if req.Description == "" {
		respondWithError(w, http.StatusBadRequest, "Description is required")
		return
	}

	// Validate ObjectType enum
	validTypes := []ObjectType{
		ObjectTypePerson, ObjectTypePlace, ObjectTypeArtifact,
		ObjectTypeEvent, ObjectTypeInstitution, ObjectTypeOther,
	}
	isValid := false
	for _, t := range validTypes {
		if req.Type == t {
			isValid = true
			break
		}
	}
	if !isValid {
		respondWithError(w, http.StatusBadRequest, "Invalid object type. Must be one of: person, place, artifact, event, institution, other")
		return
	}

	now := getCurrentTimestamp()
	object := HistoricalObject{
		ID:          uuid.New().String(),
		Name:        req.Name,
		Type:        req.Type,
		Description: req.Description,
		ImageURL:    req.ImageURL,
		EntryIDs:    []string{}, // Initialize empty
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	if err := s.storage.CreateObject(object); err != nil {
		log.Printf("Error creating object: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create object")
		return
	}

	log.Printf("Created new object: %s (%s)", object.Name, object.ID)
	respondWithJSON(w, http.StatusCreated, object)
}

// UpdateObject handles PUT /api/objects/:id
func (s *Server) UpdateObject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing object ID")
		return
	}

	var req UpdateObjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding update object request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate ObjectType if provided
	if req.Type != nil {
		validTypes := []ObjectType{
			ObjectTypePerson, ObjectTypePlace, ObjectTypeArtifact,
			ObjectTypeEvent, ObjectTypeInstitution, ObjectTypeOther,
		}
		isValid := false
		for _, t := range validTypes {
			if *req.Type == t {
				isValid = true
				break
			}
		}
		if !isValid {
			respondWithError(w, http.StatusBadRequest, "Invalid object type. Must be one of: person, place, artifact, event, institution, other")
			return
		}
	}

	object, err := s.storage.UpdateObject(id, req)
	if err != nil {
		log.Printf("Error updating object %s: %v", id, err)
		if err.Error() == "object not found" {
			respondWithError(w, http.StatusNotFound, "Object not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to update object")
		}
		return
	}

	log.Printf("Updated object: %s", id)
	respondWithJSON(w, http.StatusOK, object)
}

// DeleteObject handles DELETE /api/objects/:id
func (s *Server) DeleteObject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing object ID")
		return
	}

	if err := s.storage.DeleteObject(id); err != nil {
		log.Printf("Error deleting object %s: %v", id, err)
		if err.Error() == "object not found" {
			respondWithError(w, http.StatusNotFound, "Object not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to delete object")
		}
		return
	}

	log.Printf("Deleted object: %s (cascade deleted related entries)", id)
	respondWithData(w, http.StatusOK, map[string]string{"id": id}, "Object and related entries deleted successfully")
}

// GetAllEntries handles GET /api/entries
func (s *Server) GetAllEntries(w http.ResponseWriter, r *http.Request) {
	entries := s.storage.GetAllEntries()
	respondWithJSON(w, http.StatusOK, entries)
}

// GetEntryByID handles GET /api/entries/:id
func (s *Server) GetEntryByID(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing entry ID")
		return
	}

	entry, err := s.storage.GetEntryByID(id)
	if err != nil {
		log.Printf("Error getting entry %s: %v", id, err)
		respondWithError(w, http.StatusNotFound, "Entry not found")
		return
	}

	respondWithJSON(w, http.StatusOK, entry)
}

// CreateEntry handles both POST /api/objects/:id/entries and POST /api/entries
func (s *Server) CreateEntry(w http.ResponseWriter, r *http.Request) {
	// Support both nested route (/api/objects/:id/entries)
	// and direct route (/api/entries)
	objectIDFromURL := chi.URLParam(r, "id")

	var req CreateEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding create entry request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Use URL param if available, otherwise use request body
	objectID := req.ObjectID
	if objectIDFromURL != "" {
		objectID = objectIDFromURL
	}

	// Validate required fields
	if objectID == "" {
		respondWithError(w, http.StatusBadRequest, "Object ID is required")
		return
	}
	if req.LocationName == "" {
		respondWithError(w, http.StatusBadRequest, "Location name is required")
		return
	}
	if req.StartDate == "" {
		respondWithError(w, http.StatusBadRequest, "Start date is required")
		return
	}
	if req.Description == "" {
		respondWithError(w, http.StatusBadRequest, "Description is required")
		return
	}

	// Verify object exists
	if _, err := s.storage.GetObjectByID(objectID); err != nil {
		respondWithError(w, http.StatusNotFound, "Object not found")
		return
	}

	// Initialize empty slices if nil
	sources := req.Sources
	if sources == nil {
		sources = []string{}
	}
	tags := req.Tags
	if tags == nil {
		tags = []string{}
	}

	now := getCurrentTimestamp()
	entry := Entry{
		ID:           uuid.New().String(),
		ObjectID:     objectID,
		Location:     req.Location,
		LocationName: req.LocationName,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		Description:  req.Description,
		Sources:      sources,
		Tags:         tags,
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.storage.CreateEntry(entry); err != nil {
		log.Printf("Error creating entry: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create entry")
		return
	}

	log.Printf("Created new entry for object %s: %s", objectID, entry.LocationName)
	respondWithJSON(w, http.StatusCreated, entry)
}

// UpdateEntry handles PUT /api/entries/:id
func (s *Server) UpdateEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing entry ID")
		return
	}

	var req UpdateEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding update entry request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// If objectID is being changed, verify new object exists
	if req.ObjectID != nil {
		if _, err := s.storage.GetObjectByID(*req.ObjectID); err != nil {
			respondWithError(w, http.StatusNotFound, "New object not found")
			return
		}
	}

	entry, err := s.storage.UpdateEntry(id, req)
	if err != nil {
		log.Printf("Error updating entry %s: %v", id, err)
		if err.Error() == "entry not found" {
			respondWithError(w, http.StatusNotFound, "Entry not found")
		} else if err.Error() == "new object not found" {
			respondWithError(w, http.StatusNotFound, "New object not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to update entry")
		}
		return
	}

	log.Printf("Updated entry: %s", id)
	respondWithJSON(w, http.StatusOK, entry)
}

// DeleteEntry handles DELETE /api/entries/:id
func (s *Server) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing entry ID")
		return
	}

	if err := s.storage.DeleteEntry(id); err != nil {
		log.Printf("Error deleting entry %s: %v", id, err)
		if err.Error() == "entry not found" {
			respondWithError(w, http.StatusNotFound, "Entry not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to delete entry")
		}
		return
	}

	log.Printf("Deleted entry: %s", id)
	respondWithData(w, http.StatusOK, map[string]string{"id": id}, "Entry deleted successfully")
}
