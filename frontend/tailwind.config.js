/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Colonial/Historical color palette
        'parchment': '#F4E8D0',
        'aged-paper': '#E8DCC4',
        'sepia': '#704214',
        'colonial-brown': '#5C4033',
        'ink-black': '#2B2B2B',
        'aged-ink': '#3D3D3D',
        'colonial-red': '#8B2635',
        'colonial-blue': '#3A5A78',
        'colonial-gold': '#D4AF37',
        'aged-green': '#5A7247',
        'map-border': '#8B7355',
      },
      fontFamily: {
        'serif': ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
}
