/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        btc: {
          orange: '#F7931A',
          gold: '#FFB347',
          dark: '#0E0E10',
          darker: '#0A0A0C',
          card: '#1C1C1E',
          border: '#2A2A2A',
          surface: '#1A1A1C',
        },
        neon: {
          blue: '#00D4FF',
          green: '#00FF88',
          purple: '#A855F7',
          pink: '#FF006E',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(247, 147, 26, 0.3)',
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.3)',
        'glow-green': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.3)',
      },
      animation: {
        'snap-in': 'snapIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'snap-out': 'snapOut 0.3s ease-in',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'flow-right': 'flowRight 1.5s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        snapIn: {
          '0%': { transform: 'scale(0.8) translateY(-10px)', opacity: '0' },
          '50%': { transform: 'scale(1.05) translateY(2px)' },
          '100%': { transform: 'scale(1) translateY(0)', opacity: '1' },
        },
        snapOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.8) translateY(-10px)', opacity: '0' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(247, 147, 26, 0.2)' },
          '50%': { boxShadow: '0 0 25px rgba(247, 147, 26, 0.5)' },
        },
        flowRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
    },
  },
  plugins: [],
};
