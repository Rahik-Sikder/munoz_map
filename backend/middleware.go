package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
)

const adminKeyHeader = "X-Admin-Key"

// AuthMiddleware checks for valid admin key in request header
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		adminKey := os.Getenv("ADMIN_KEY")
		if adminKey == "" {
			adminKey = "dev-key-123"
		}

		providedKey := r.Header.Get(adminKeyHeader)
		if providedKey == "" {
			log.Printf("Authentication failed: missing %s header", adminKeyHeader)
			respondWithError(w, http.StatusUnauthorized, "Missing admin key")
			return
		}

		if providedKey != adminKey {
			log.Printf("Authentication failed: invalid admin key")
			respondWithError(w, http.StatusUnauthorized, "Invalid admin key")
			return
		}

		next.ServeHTTP(w, r)
	})
}

// respondWithError sends a JSON error response
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Error: message})
}

// respondWithJSON sends a JSON response
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	if err := json.NewEncoder(w).Encode(payload); err != nil {
		log.Printf("Error encoding JSON response: %v", err)
	}
}
