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
        light: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          primary: '#6D5EF6',
          hover: '#5A4DE8',
          text: '#111827',
          border: '#E5E7EB',
        },
        dark: {
          bg: '#0B1020',
          card: '#1E293B',
          primary: '#7C5CFF',
          accent: '#4F46E5',
          text: '#FFFFFF',
          border: '#334155',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}