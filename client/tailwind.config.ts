import type { Config } from 'tailwindcss'

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        heartbeat: 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.04)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.04)' },
          '70%': { transform: 'scale(1)' },
        }
      },
      boxShadow: {
        'cyan-glow': '0 0 15px rgba(8, 145, 178, 0.4)',
        'red-glow': '0 0 10px rgba(239, 68, 68, 0.3)',
      }
    },
  },
  plugins: [],
} satisfies Config
