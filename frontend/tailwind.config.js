/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"Manrope"', 'sans-serif'],
        display: ['"Manrope"', '"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        app: {
          bg: '#FAFAF7',       // Warm white / soft ivory canvas background
          surface: '#FFFFFF',  // Clean white card and panel surface
          subtle: '#F4F4F0',   // Subtle secondary background
          border: '#E2E8F0',   // Soft border line
          borderHover: '#CBD5E1',
          ink: '#0F172A',      // Dark slate / charcoal text
          muted: '#64748B',    // Muted slate secondary text
        },
        charcoal: {
          DEFAULT: '#0F172A',
          950: '#020617',
          900: '#0F172A',
          850: '#1E293B',
          800: '#334155',
          700: '#475569',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          elevated: '#F8FAFC',
          border: '#E2E8F0',
        },
        ivory: {
          DEFAULT: '#0F172A',
          muted: '#334155',
          dark: '#64748B',
        },
        brand: {
          violet: '#4F46E5',         // Modern Indigo primary
          'violet-light': '#6366F1',
          cobalt: '#2563EB',         // Vibrant Blue
          coral: '#F97316',          // Warm Amber/Orange accent
          'coral-light': '#FB923C',
          emerald: '#10B981',        // Success
          amber: '#F59E0B',          // Warning
          cyan: '#06B6D4',
        }
      },
      boxShadow: {
        'soft-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 1px 4px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 8px 24px -4px rgba(0, 0, 0, 0.06), 0 4px 8px -2px rgba(0, 0, 0, 0.03)',
        'soft-lg': '0 16px 36px -6px rgba(0, 0, 0, 0.08), 0 6px 12px -3px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
}
