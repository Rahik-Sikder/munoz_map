# Quick Start Guide

## Running the Development Server

```bash
npm run dev
```

Then open http://localhost:5173 in your browser.

## Project Overview

### Pages
- **/** - Main map view with interactive map, timeline, and filters
- **/admin** - Admin panel for managing objects and entries

### Components Created
- **Map** - Interactive Leaflet map with markers
- **Timeline** - Chronological view of entries
- **EntryDetail** - Detailed view of selected entry
- **ObjectFilter** - Advanced filtering UI

### API Configuration
The API base URL is configured via `.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

Update this to point to your backend server.

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

## Next Steps

1. Start your backend server (see backend README)
2. Run `npm run dev` to start the frontend
3. Navigate to http://localhost:5173
4. Use the Admin Panel at http://localhost:5173/admin to add objects and entries

## Color Palette

The colonial/historical theme uses these colors:
- Parchment (#F4E8D0) - Main background
- Colonial Brown (#5C4033) - Primary text
- Colonial Blue (#3A5A78) - Interactive elements
- Colonial Gold (#D4AF37) - Highlights
- Colonial Red (#8B2635) - Dates/alerts
- Map Border (#8B7355) - Borders

All colors are configured in `tailwind.config.js`.
