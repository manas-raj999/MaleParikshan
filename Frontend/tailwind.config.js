/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Outfit"', 'sans-serif'],
        body: ['"Nunito"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: '#0d0f1a',
        'navy-2': '#12152a',
        'navy-3': '#181c35',
        'navy-4': '#1e2340',
        card: '#161929',
        'card-2': '#1c2038',
        border: '#252a4a',
        'border-2': '#2e3560',
        blue: '#4d7cff',
        'blue-2': '#6b8fff',
        'blue-glow': '#3d63cc',
        cyan: '#00d4ff',
        'cyan-dim': '#00a8cc',
        teal: '#0cf0c0',
        orange: '#ff7b2e',
        'orange-dim': '#cc5e1e',
        gold: '#ffb830',
        'gold-dim': '#cc8f1f',
        green: '#4ade80',
        red: '#ff4d6a',
        muted: '#5a6190',
        subtle: '#3a4070',
      },
      backgroundImage: {
        'card-gradient': 'linear-gradient(135deg, #161929 0%, #1c2038 100%)',
        'blue-gradient': 'linear-gradient(135deg, #4d7cff 0%, #00d4ff 100%)',
        'orange-gradient': 'linear-gradient(135deg, #ff7b2e 0%, #ffb830 100%)',
        'streak-gradient': 'linear-gradient(135deg, #ff7b2e22 0%, #ffb83022 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 10px rgba(77,124,255,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(77,124,255,0.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      boxShadow: {
        'blue-glow': '0 0 20px rgba(77,124,255,0.25)',
        'orange-glow': '0 0 20px rgba(255,123,46,0.25)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'inner-glow': 'inset 0 1px 0 rgba(255,255,255,0.05)',
      },
    },
  },
  plugins: [],
}
