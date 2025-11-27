# Colonial Latin America Mapping Project

A full-stack web application for visualizing historical figures and objects across geography and time for CS346K.

## Project Overview

This application allows users to explore historical data from Colonial Latin America through an interactive map interface. Users can filter by time periods, view historical figures and objects at specific locations, and navigate through different time periods to see how the landscape changed.

## Tech Stack

### Frontend
- **React** with **TypeScript** - Modern UI library with type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Leaflet** - Interactive map visualization
- **Vite** - Fast build tool and dev server

### Backend
- **Go** - Fast, statically typed backend language
- **Standard Library** - Minimal dependencies
- **JSON File Storage** - Simple data persistence

## Project Structure

```
munoz_map/
├── frontend/          # React + TypeScript application
├── backend/           # Go API server
├── docs/              # Documentation (to be added)
├── .claude            # Claude Code configuration
├── docker-compose.yml # Local development setup
└── README.md          # This file
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Go 1.21+
- Docker (optional, for containerized development)

### Local Development

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

#### Backend
```bash
cd backend
go run main.go
```

The backend API will be available at http://localhost:8080

#### Using Docker Compose
```bash
docker-compose up
```

This will start both frontend and backend services.

## Deployment

- **Frontend**: Deployed to Vercel
- **Backend**: Deployed to Railway.app or Fly.io

## Development Philosophy

This is a student project with a focus on:
- Working code over perfect code
- Simplicity and ease of deployment
- Clear, readable code with helpful comments
- Minimal dependencies
- Rapid iteration and learning

## Features (Planned)

- Interactive map with historical markers
- Time period filtering
- Search and filter by historical figures and objects
- Detailed information panels for each marker
- Responsive design for mobile and desktop
- Export/share functionality

## Contributing

This is a course project. Development guidelines:
- Write clean, commented code
- Test your changes locally
- Follow the existing code style
- Keep commits focused and descriptive

## License

This project is for educational purposes as part of CS346K.
