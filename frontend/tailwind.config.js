/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        // Core design tokens (exact required names)
        'color-bg': 'var(--color-bg)',
        'color-surface': 'var(--color-surface)',
        'color-surface-border': 'var(--color-surface-border)',
        'color-text-primary': 'var(--color-text-primary)',
        'color-text-secondary': 'var(--color-text-secondary)',
        'color-accent': 'var(--color-accent)',
        'color-accent-hover': 'var(--color-accent-hover)',
        'color-success': 'var(--color-success)',
        'color-warning': 'var(--color-warning)',
        'color-danger': 'var(--color-danger)',

        // Semantic shortcuts
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          border: 'var(--color-surface-border)',
        },
        'surface-border': 'var(--color-surface-border)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          light: '#FAF0EB',
          border: '#F0DACF',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          light: '#EEF5F0',
          border: '#D2E6D7',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          light: '#FDF7EE',
          border: '#F5E2C4',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          light: '#FBF0EE',
          border: '#F3CEC9',
        },

        // Shadcn UI tokens mapped directly to warm beige design tokens
        border: 'var(--color-surface-border)',
        input: 'var(--color-surface-border)',
        ring: 'var(--color-accent)',
        background: 'var(--color-bg)',
        foreground: 'var(--color-text-primary)',
        primary: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5EFEB',
          foreground: 'var(--color-text-primary)',
        },
        destructive: {
          DEFAULT: 'var(--color-danger)',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F5EFEB',
          foreground: 'var(--color-text-secondary)',
        },
        popover: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
        card: {
          DEFAULT: 'var(--color-surface)',
          foreground: 'var(--color-text-primary)',
        },
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(58, 53, 48, 0.05), 0 1px 2px -1px rgba(58, 53, 48, 0.05)',
        'warm': '0 4px 14px -2px rgba(58, 53, 48, 0.06), 0 2px 6px -1px rgba(58, 53, 48, 0.03)',
        'warm-md': '0 8px 24px -4px rgba(58, 53, 48, 0.08), 0 3px 8px -2px rgba(58, 53, 48, 0.04)',
        'warm-lg': '0 16px 36px -6px rgba(58, 53, 48, 0.10), 0 4px 12px -2px rgba(58, 53, 48, 0.05)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fill-progress": {
          from: { width: "0%" },
          to: { width: "var(--progress-width, 100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fill-progress": "fill-progress 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}