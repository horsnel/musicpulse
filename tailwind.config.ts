import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // MusicPulse design tokens — matches the CSS variables in globals.css
        bg: {
          DEFAULT: '#08090d',
          2: '#0e0f16',
          3: '#13141e',
          4: '#181928',
        },
        border: {
          DEFAULT: '#1c1e2e',
          2: '#252840',
        },
        text: {
          DEFAULT: '#f0f0f8',
          2: '#9899b8',
          3: '#545670',
        },
        green: {
          DEFAULT: '#1DB954',
          dim: 'rgba(29,185,84,0.12)',
        },
        pink: {
          DEFAULT: '#ff2d6b',
          dim: 'rgba(255,45,107,0.1)',
        },
        blue: {
          DEFAULT: '#4361ff',
          dim: 'rgba(67,97,255,0.12)',
        },
        gold: {
          DEFAULT: '#ffb830',
          dim: 'rgba(255,184,48,0.1)',
        },
        purple: {
          DEFAULT: '#b06cff',
          dim: 'rgba(176,108,255,0.1)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        grotesk: ['Space Grotesk', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      borderRadius: {
        card: '14px',
        pill: '100px',
      },
      animation: {
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'bar-bounce': 'barBounce 0.8s ease-in-out infinite',
        'grad-shift': 'gradShift 8s linear infinite',
        'ticker': 'ticker 30s linear infinite',
        'fade-up': 'fadeUp 0.45s ease both',
        'vinyl-spin': 'vinylSpin 8s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
        barBounce: {
          '0%, 100%': { transform: 'scaleY(0.3)' },
          '50%': { transform: 'scaleY(1)' },
        },
        gradShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '400% 50%' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        vinylSpin: {
          from: { transform: 'translateY(-50%) rotate(0deg)' },
          to: { transform: 'translateY(-50%) rotate(360deg)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
