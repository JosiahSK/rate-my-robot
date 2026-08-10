/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        cyber: {
          50:  '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6e0',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        neon: {
          green:  '#39ff14',
          blue:   '#00f5ff',
          pink:   '#ff006e',
          yellow: '#ffe600',
          purple: '#bf00ff',
        },
        dark: {
          900: '#060a10',
          800: '#0a1020',
          700: '#0f1929',
          600: '#162135',
          500: '#1e2d42',
          400: '#273d57',
        },
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(rgba(20,184,166,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.05) 1px, transparent 1px)",
        'hero-gradient': 'radial-gradient(ellipse at top, #0f766e22 0%, #060a10 60%)',
        'card-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 3s linear infinite',
        'meter-fill': 'meterFill 1.5s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-in': 'slideIn 0.4s ease-out forwards',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(20,184,166,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(20,184,166,0.8), 0 0 60px rgba(20,184,166,0.4)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        scan: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        meterFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--target-width)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 10px rgba(20,184,166,0.5)' },
          '50%': { textShadow: '0 0 20px rgba(20,184,166,1), 0 0 40px rgba(20,184,166,0.5)' },
        },
      },
      boxShadow: {
        'neon-teal': '0 0 20px rgba(20,184,166,0.5), 0 0 40px rgba(20,184,166,0.2)',
        'neon-pink': '0 0 20px rgba(255,0,110,0.5), 0 0 40px rgba(255,0,110,0.2)',
        'neon-blue': '0 0 20px rgba(0,245,255,0.5), 0 0 40px rgba(0,245,255,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'card': '0 4px 24px rgba(0,0,0,0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
