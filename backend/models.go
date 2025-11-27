package main

// Entry represents a single location/event in an object's history
type Entry struct {
	ID          string  `json:"id"`
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
	Date        string  `json:"date"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Order       int     `json:"order"`
}

// Object represents a historical object/person being tracked
type Object struct {
	ID      string  `json:"id"`
	Name    string  `json:"name"`
	Type    string  `json:"type"`
	Entries []Entry `json:"entries"`
}

// DataStore represents the structure of the JSON file
type DataStore struct {
	Objects []Object `json:"objects"`
}

// CreateObjectRequest represents the request body for creating a new object
type CreateObjectRequest struct {
	Name string `json:"name"`
	Type string `json:"type"`
}

// CreateEntryRequest represents the request body for adding an entry
type CreateEntryRequest struct {
	Lat         float64 `json:"lat"`
	Lng         float64 `json:"lng"`
	Date        string  `json:"date"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Order       int     `json:"order"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}
