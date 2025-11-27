# Munoz Map - Historical Mapping Frontend

A React + TypeScript + Vite frontend application for visualizing historical figures and objects from Colonial Latin America across geography and time.

## Features

- **Interactive Map**: Visualize historical entries on a Leaflet map
- **Timeline View**: Browse entries chronologically
- **Advanced Filtering**: Filter by object type, date range, tags, and search
- **Entry Details**: View detailed information about historical objects and their locations
- **Admin Panel**: Manage historical objects and entries
- **Responsive Design**: Works on desktop and mobile devices
- **Colonial Theme**: Historical color palette matching the project theme

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **React Router** for navigation
- **React Leaflet** for interactive maps
- **Tailwind CSS** for styling
- **Custom Colonial/Historical Color Palette**

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running (see backend README)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update `VITE_API_BASE_URL` if needed (default: `http://localhost:8080/api`)

### Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── api/           # API client and backend communication
├── components/    # Reusable React components
│   ├── Map.tsx
│   ├── Timeline.tsx
│   ├── EntryDetail.tsx
│   └── ObjectFilter.tsx
├── pages/         # Page components
│   ├── MapView.tsx
│   └── AdminPanel.tsx
├── types/         # TypeScript type definitions
│   └── index.ts
├── App.tsx        # Main app component with routing
├── main.tsx       # Application entry point
└── index.css      # Global styles with Tailwind
```

## Color Palette

The application uses a custom colonial/historical color palette:

- **Parchment** (`#F4E8D0`) - Background
- **Aged Paper** (`#E8DCC4`) - Secondary background
- **Colonial Brown** (`#5C4033`) - Primary text
- **Sepia** (`#704214`) - Accent text
- **Colonial Blue** (`#3A5A78`) - Interactive elements
- **Colonial Gold** (`#D4AF37`) - Highlights
- **Colonial Red** (`#8B2635`) - Alerts/dates
- **Aged Green** (`#5A7247`) - Success messages
- **Map Border** (`#8B7355`) - Borders and dividers

## Routes

- `/` - Main map view with timeline and filters
- `/admin` - Admin panel for managing objects and entries

## Environment Variables

- `VITE_API_BASE_URL` - Base URL for the backend API

## Development Notes

- Built with functional components and React hooks
- Follows TypeScript strict mode
- Uses Tailwind utility classes (no custom CSS)
- API client includes proper error handling
- Responsive design with mobile-first approach

## Deployment

The frontend is designed to be deployed on **Vercel**:

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy!

## License

This is a student project for CS346K - Colonial Latin America course.
