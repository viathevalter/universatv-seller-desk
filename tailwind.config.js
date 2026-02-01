/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        surface: 'var(--surface)',
        surfaceHighlight: 'var(--surface-highlight)',
        primary: 'var(--primary)',
        primaryHover: 'var(--primary-hover)',
        secondary: 'var(--secondary)',
        textMain: 'var(--text-main)',
        textMuted: 'var(--text-muted)',
        border: 'var(--border)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
