package main

// ObjectType represents the type of historical object
type ObjectType string

const (
	ObjectTypePerson      ObjectType = "person"
	ObjectTypePlace       ObjectType = "place"
	ObjectTypeArtifact    ObjectType = "artifact"
	ObjectTypeEvent       ObjectType = "event"
	ObjectTypeInstitution ObjectType = "institution"
	ObjectTypeOther       ObjectType = "other"
)

// Coordinates represents a geographic location
type Coordinates struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

// Entry represents a single location/event in an object's history
type Entry struct {
	ID           string      `json:"id"`
	ObjectID     string      `json:"objectId"`
	Location     Coordinates `json:"location"`
	LocationName string      `json:"locationName"`
	StartDate    string      `json:"startDate"`
	EndDate      *string     `json:"endDate,omitempty"`
	Description  string      `json:"description"`
	Sources      []string    `json:"sources"`
	Tags         []string    `json:"tags"`
	CreatedAt    string      `json:"createdAt"`
	UpdatedAt    string      `json:"updatedAt"`
}

// HistoricalObject represents a historical object/person being tracked
type HistoricalObject struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Type        ObjectType `json:"type"`
	Description string     `json:"description"`
	ImageURL    *string    `json:"imageUrl,omitempty"`
	EntryIDs    []string   `json:"entryIds"`
	CreatedAt   string     `json:"createdAt"`
	UpdatedAt   string     `json:"updatedAt"`
}

// DataStore represents the structure of the JSON file
type DataStore struct {
	Objects []HistoricalObject `json:"objects"`
	Entries []Entry            `json:"entries"`
}

// CreateObjectRequest represents the request body for creating a new object
type CreateObjectRequest struct {
	Name        string     `json:"name"`
	Type        ObjectType `json:"type"`
	Description string     `json:"description"`
	ImageURL    *string    `json:"imageUrl,omitempty"`
}

// CreateEntryRequest represents the request body for adding an entry
type CreateEntryRequest struct {
	ObjectID     string      `json:"objectId"`
	Location     Coordinates `json:"location"`
	LocationName string      `json:"locationName"`
	StartDate    string      `json:"startDate"`
	EndDate      *string     `json:"endDate,omitempty"`
	Description  string      `json:"description"`
	Sources      []string    `json:"sources"`
	Tags         []string    `json:"tags"`
}

// UpdateObjectRequest represents the request body for updating an object
type UpdateObjectRequest struct {
	Name        *string     `json:"name,omitempty"`
	Type        *ObjectType `json:"type,omitempty"`
	Description *string     `json:"description,omitempty"`
	ImageURL    *string     `json:"imageUrl,omitempty"`
}

// UpdateEntryRequest represents the request body for updating an entry
type UpdateEntryRequest struct {
	ObjectID     *string      `json:"objectId,omitempty"`
	Location     *Coordinates `json:"location,omitempty"`
	LocationName *string      `json:"locationName,omitempty"`
	StartDate    *string      `json:"startDate,omitempty"`
	EndDate      *string      `json:"endDate,omitempty"`
	Description  *string      `json:"description,omitempty"`
	Sources      []string     `json:"sources,omitempty"`
	Tags         []string     `json:"tags,omitempty"`
}

// ApiResponse represents a successful API response
type ApiResponse struct {
	Data    interface{} `json:"data"`
	Message *string     `json:"message,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error string `json:"error"`
}
