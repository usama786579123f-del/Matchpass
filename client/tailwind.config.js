/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAFAF9',
          muted: '#F1F5F4',
        },
        ink: {
          DEFAULT: '#0B1220',
          light: '#1E293B',
        },
        primary: {
          50: '#EBF6EE',
          100: '#CEEAD5',
          200: '#9FD5AC',
          300: '#6BBB7E',
          400: '#3F9C57',
          500: '#1B7A3D',
          600: '#166332',
          700: '#124F29',
          800: '#0E3D20',
          900: '#0A2E18',
        },
        secondary: {
          50: '#EAF1F8',
          100: '#C9DCED',
          200: '#9DC0DE',
          300: '#699FCB',
          400: '#3A7DB4',
          500: '#0F4C81',
          600: '#0D3F6B',
          700: '#0A3255',
          800: '#082640',
          900: '#051A2B',
        },
        gold: {
          50: '#FDF8EC',
          100: '#F9EBC9',
          200: '#F3D68F',
          300: '#EDC260',
          400: '#E8B94A',
          500: '#D9A22E',
          600: '#B58323',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: '#1B7A3D',
        warning: '#D9A22E',
        danger: '#DC2626',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.12', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-sm': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(11, 18, 32, 0.04), 0 1px 3px 0 rgba(11, 18, 32, 0.06)',
        card: '0 2px 8px -2px rgba(11, 18, 32, 0.08), 0 4px 16px -4px rgba(11, 18, 32, 0.06)',
        elevated: '0 8px 24px -4px rgba(11, 18, 32, 0.10), 0 4px 8px -4px rgba(11, 18, 32, 0.06)',
        'glow-primary': '0 0 0 3px rgba(27, 122, 61, 0.15)',
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};