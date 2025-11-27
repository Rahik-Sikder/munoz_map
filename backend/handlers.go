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
	respondWithJSON(w, http.StatusOK, map[string]interface{}{
		"objects": objects,
	})
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
	if req.Type == "" {
		respondWithError(w, http.StatusBadRequest, "Type is required")
		return
	}

	// Create new object with generated ID
	object := Object{
		ID:      uuid.New().String(),
		Name:    req.Name,
		Type:    req.Type,
		Entries: []Entry{},
	}

	if err := s.storage.CreateObject(object); err != nil {
		log.Printf("Error creating object: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to create object")
		return
	}

	log.Printf("Created new object: %s (%s)", object.Name, object.ID)
	respondWithJSON(w, http.StatusCreated, object)
}

// CreateEntry handles POST /api/objects/:id/entries
func (s *Server) CreateEntry(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "Missing object ID")
		return
	}

	var req CreateEntryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding create entry request: %v", err)
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Title == "" {
		respondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}
	if req.Date == "" {
		respondWithError(w, http.StatusBadRequest, "Date is required")
		return
	}

	// Create new entry with generated ID
	entry := Entry{
		ID:          uuid.New().String(),
		Lat:         req.Lat,
		Lng:         req.Lng,
		Date:        req.Date,
		Title:       req.Title,
		Description: req.Description,
		Order:       req.Order,
	}

	if err := s.storage.AddEntry(id, entry); err != nil {
		log.Printf("Error adding entry to object %s: %v", id, err)
		if err.Error() == "object not found" {
			respondWithError(w, http.StatusNotFound, "Object not found")
		} else {
			respondWithError(w, http.StatusInternalServerError, "Failed to add entry")
		}
		return
	}

	log.Printf("Added new entry to object %s: %s", id, entry.Title)
	respondWithJSON(w, http.StatusCreated, entry)
}
