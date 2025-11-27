# Historical Mapping Backend API

A simple REST API built with Go for tracking historical objects and their geographical locations over time.

## Features

- RESTful API with Chi router
- JSON file-based storage
- CORS support for frontend integration
- Simple API key authentication
- Thread-safe data operations
- Docker support for easy deployment
- Graceful shutdown handling

## API Endpoints

### Public Endpoints

#### GET /api/objects
Returns all objects with their entries.

**Response:**
```json
{
  "objects": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "entries": [...]
    }
  ]
}
```

#### GET /api/objects/:id
Returns a specific object with its entries.

**Response:**
```json
{
  "id": "string",
  "name": "string",
  "type": "string",
  "entries": [
    {
      "id": "string",
      "lat": 0.0,
      "lng": 0.0,
      "date": "string",
      "title": "string",
      "description": "string",
      "order": 0
    }
  ]
}
```

### Protected Endpoints (Require Authentication)

Authentication is done via the `X-Admin-Key` header.

#### POST /api/objects
Creates a new object.

**Headers:**
```
X-Admin-Key: your-admin-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Christopher Columbus",
  "type": "Explorer"
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "name": "Christopher Columbus",
  "type": "Explorer",
  "entries": []
}
```

#### POST /api/objects/:id/entries
Adds a new entry to an existing object.

**Headers:**
```
X-Admin-Key: your-admin-key
Content-Type: application/json
```

**Request Body:**
```json
{
  "lat": 37.2315,
  "lng": -6.8899,
  "date": "1492-08-03",
  "title": "Departure from Palos",
  "description": "Columbus departed from Spain...",
  "order": 1
}
```

**Response:**
```json
{
  "id": "generated-uuid",
  "lat": 37.2315,
  "lng": -6.8899,
  "date": "1492-08-03",
  "title": "Departure from Palos",
  "description": "Columbus departed from Spain...",
  "order": 1
}
```

### Health Check

#### GET /health
Returns server health status.

**Response:**
```json
{
  "status": "ok"
}
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 8080 |
| ADMIN_KEY | API key for protected endpoints | dev-key-123 |
| FRONTEND_URL | Frontend URL for CORS | http://localhost:5173 |

## Running Locally

### Prerequisites
- Go 1.21 or higher

### Install Dependencies
```bash
go mod download
```

### Run the Server
```bash
go run .
```

The server will start on `http://localhost:8080`.

### Run with Custom Configuration
```bash
PORT=3000 ADMIN_KEY=my-secret-key go run .
```

## Running with Docker

### Build the Image
```bash
docker build -t munoz-map-backend .
```

### Run the Container
```bash
docker run -p 8080:8080 \
  -e ADMIN_KEY=your-secret-key \
  -e FRONTEND_URL=http://localhost:5173 \
  munoz-map-backend
```

### Run with Docker Compose
Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      - ADMIN_KEY=your-secret-key
      - FRONTEND_URL=http://localhost:5173
    volumes:
      - ./backend/data.json:/app/data.json
```

Then run:
```bash
docker-compose up
```

## Project Structure

```
backend/
├── main.go           # Server setup and routing
├── handlers.go       # HTTP request handlers
├── storage.go        # JSON file operations
├── models.go         # Data structures
├── middleware.go     # Auth and response utilities
├── data.json         # Persistent data storage
├── go.mod            # Go module definition
├── Dockerfile        # Docker configuration
└── README.md         # This file
```

## Data Storage

Data is stored in `data.json` with the following structure:

```json
{
  "objects": [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "entries": [
        {
          "id": "string",
          "lat": 0.0,
          "lng": 0.0,
          "date": "string",
          "title": "string",
          "description": "string",
          "order": 0
        }
      ]
    }
  ]
}
```

The file is read into memory on startup and written back after modifications. All operations are thread-safe using mutex locks.

## Error Handling

All errors return JSON responses with appropriate HTTP status codes:

- `400 Bad Request` - Invalid request body or missing required fields
- `401 Unauthorized` - Missing or invalid admin key
- `404 Not Found` - Object not found
- `500 Internal Server Error` - Server-side errors

**Error Response Format:**
```json
{
  "error": "Error message description"
}
```

## Development

### Code Organization
- Handlers are methods on a `Server` struct
- Storage operations are separate from HTTP logic
- Middleware handles cross-cutting concerns
- Models define all data structures

### Testing the API

Using curl:

```bash
# Get all objects
curl http://localhost:8080/api/objects

# Get specific object
curl http://localhost:8080/api/objects/columbus-1492

# Create new object
curl -X POST http://localhost:8080/api/objects \
  -H "X-Admin-Key: dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hernán Cortés","type":"Person"}'

# Add entry to object
curl -X POST http://localhost:8080/api/objects/columbus-1492/entries \
  -H "X-Admin-Key: dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 25.0,
    "lng": -75.0,
    "date": "1492-10-28",
    "title": "Arrival in Cuba",
    "description": "Columbus arrived at the coast of Cuba",
    "order": 4
  }'
```

## License

MIT
