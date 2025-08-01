/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
  "./src/**/*.{js,ts,jsx,tsx}",  // Make sure this matches your file structure
  "./index.html"
],
  theme: {
    extend: {
      colors: {
        // Prog Rock Tech Palette
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a4b8ff',
          400: '#818cff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        
        // Neon accent colors
        accent: {
          cyan: '#00ffff',
          electric: '#00d4ff',
          purple: '#8b5cf6',
          pink: '#ff00ff',
          green: '#00ff88',
        },
        
        // Matte blacks and grays
        matte: {
          black: '#0a0a0a',
          charcoal: '#0d0d0d',
          carbon: '#121212',
          slate: '#1a1a1a',
          steel: '#2a2a2a',
        },
        
        // Glass and transparency effects
        glass: {
          light: 'rgba(255, 255, 255, 0.08)',
          medium: 'rgba(255, 255, 255, 0.12)',
          heavy: 'rgba(255, 255, 255, 0.16)',
          dark: 'rgba(0, 0, 0, 0.4)',
          darker: 'rgba(0, 0, 0, 0.7)',
        },
        
        // Technical gradients
        tech: {
          glow: 'rgba(0, 255, 255, 0.3)',
          pulse: 'rgba(139, 92, 246, 0.4)',
          data: 'rgba(0, 212, 255, 0.2)',
        }
      },
      
      fontFamily: {
        sans: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Orbitron"', 'ui-sans-serif', 'system-ui'],
        heading: ['"Exo 2"', 'ui-sans-serif', 'system-ui'],
        code: ['"Fira Code"', 'ui-monospace', 'monospace'],
      },
      
      backgroundImage: {
        // Tech patterns
        'circuit': 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.03"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        'data-flow': 'linear-gradient(90deg, transparent 0%, rgba(0,255,255,0.1) 25%, rgba(139,92,246,0.1) 50%, rgba(0,255,255,0.1) 75%, transparent 100%)',
        'hologram': 'linear-gradient(45deg, rgba(0,255,255,0.1) 0%, rgba(139,92,246,0.1) 25%, rgba(255,0,255,0.1) 50%, rgba(0,255,136,0.1) 75%, rgba(0,255,255,0.1) 100%)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)" opacity="0.02"/%3E%3C/svg%3E")',
      },
      
      animation: {
        'pulse-neon': 'pulse-neon 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
        'data-flow': 'data-flow 4s linear infinite',
        'hologram': 'hologram 8s ease-in-out infinite',
        'circuit-pulse': 'circuit-pulse 6s ease-in-out infinite',
        'float-tech': 'float-tech 6s ease-in-out infinite',
        'scan-line': 'scan-line 3s linear infinite',
        'matrix': 'matrix 20s linear infinite',
      },
      
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(0, 255, 255, 0.4), 0 0 40px rgba(0, 255, 255, 0.2), 0 0 60px rgba(0, 255, 255, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(0, 255, 255, 0.6), 0 0 60px rgba(0, 255, 255, 0.4), 0 0 90px rgba(0, 255, 255, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        'glow-pulse': {
          '0%': { filter: 'brightness(1) drop-shadow(0 0 10px rgba(0, 255, 255, 0.3))' },
          '100%': { filter: 'brightness(1.2) drop-shadow(0 0 20px rgba(0, 255, 255, 0.6))' },
        },
        'data-flow': {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'hologram': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)'
          },
          '25%': { 
            backgroundPosition: '25% 25%',
            filter: 'hue-rotate(90deg)'
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(180deg)'
          },
          '75%': { 
            backgroundPosition: '75% 75%',
            filter: 'hue-rotate(270deg)'
          },
        },
        'circuit-pulse': {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 0.8 },
        },
        'float-tech': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '25%': { transform: 'translateY(-10px) rotate(1deg)' },
          '50%': { transform: 'translateY(-5px) rotate(0deg)' },
          '75%': { transform: 'translateY(-15px) rotate(-1deg)' },
        },
        'scan-line': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        'matrix': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
      },
      
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 255, 255, 0.5), 0 0 40px rgba(0, 255, 255, 0.3), 0 0 60px rgba(0, 255, 255, 0.1)',
        'neon-purple': '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.1)',
        'neon-pink': '0 0 20px rgba(255, 0, 255, 0.5), 0 0 40px rgba(255, 0, 255, 0.3), 0 0 60px rgba(255, 0, 255, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        'tech-glow': '0 0 50px rgba(0, 255, 255, 0.2)',
        'data-glow': '0 4px 20px rgba(0, 212, 255, 0.3)',
      },
      
      backdropBlur: {
        xs: '2px',
        '4xl': '72px',
      },
      
      fontSize: {
        '2xs': '0.625rem',
        '10xl': '10rem',
        '11xl': '12rem',
      },
      
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}