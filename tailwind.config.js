/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Casino-specific color palette
        casino: {
          // Rich golds for luxury feel
          gold: {
            50: '#fffdf0',
            100: '#fffadc',
            200: '#fff2b8',
            300: '#ffe685',
            400: '#ffd13d',
            500: '#ffb700', // Primary casino gold
            600: '#d49700',
            700: '#a67500',
            800: '#805800',
            900: '#664400',
          },
          // Deep greens for table felt
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#16a34a', // Casino table green
            600: '#15803d',
            700: '#166534',
            800: '#14532d',
            900: '#0f172a',
          },
          // Luxurious reds
          red: {
            50: '#fef2f2',
            100: '#fee2e2',
            200: '#fecaca',
            300: '#fca5a5',
            400: '#f87171',
            500: '#dc2626', // Casino red
            600: '#b91c1c',
            700: '#991b1b',
            800: '#7f1d1d',
            900: '#450a0a',
          },
          // Dark backgrounds
          dark: {
            50: '#1a1a1a',
            100: '#2d2d2d',
            200: '#404040',
            300: '#525252',
            400: '#737373',
            500: '#8b8b8b',
            600: '#a3a3a3',
            700: '#bbbbbe',
            800: '#d4d4d4',
            900: '#f5f5f5',
          }
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'Menlo', 'Monaco', 'monospace'],
        // Casino-appropriate fonts
        display: ['Playfair Display', 'serif'],
        elegant: ['Cormorant Garamond', 'serif'],
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // Casino animations
        'spin-slow': 'spin 3s linear infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'roulette-spin': 'roulette-spin 4s ease-out',
        'chip-stack': 'chip-stack 0.3s ease-out',
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'pulse-gold': {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(255, 183, 0, 0.7)',
            transform: 'scale(1)',
          },
          '70%': {
            boxShadow: '0 0 0 10px rgba(255, 183, 0, 0)',
            transform: 'scale(1.05)',
          },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'roulette-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(1440deg)' },
        },
        'chip-stack': {
          '0%': {
            transform: 'translateY(-10px) scale(0.9)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
          },
        },
      },
      backgroundImage: {
        // Casino-specific gradients
        'casino-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b  50%, #0f172a 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffb700 0%, #ffd13d  50%, #ffe685 100%)',
        'green-felt': 'linear-gradient(135deg, #14532d 0%, #16a34a 50%, #166534 100%)',
        'luxury-card': 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
      },
      boxShadow: {
        'casino': '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
        'gold': '0 10px 25px -5px rgba(255, 183, 0, 0.3), 0 10px 10px -5px rgba(255, 183, 0, 0.2)',
        'green-felt': '0 10px 25px -5px rgba(22, 163, 74, 0.3), 0 10px 10px -5px rgba(22, 163, 74, 0.2)',
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}