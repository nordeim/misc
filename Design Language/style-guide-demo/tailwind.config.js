/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        backgroundMain: '#D6F25F',
        surfacePrimary: '#FFFFFF',
        surfaceSoft: '#F9FAFB',
        textPrimary: '#111111',
        textSecondary: '#555555',
        textMuted: '#9CA3AF',
        accentPrimary: '#7B3EFF',
        accentPrimarySoft: '#EDE7FF',
        accentSecondary: '#00C6AE',
        accentYellow: '#FFB020',
        borderSubtle: '#F0F0F0',
        success: '#10B981',
        warning: '#FBBF24',
        danger: '#EF4444',
      },
      fontFamily: {
        primary: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        'pill': '9999px',
        'card': '28px',
        'card-medium': '20px',
      },
      boxShadow: {
        'card': '0 10px 25px 0 rgba(15, 23, 42, 0.06)',
        'floating': '0 18px 40px 0 rgba(15, 23, 42, 0.10)',
      },
      spacing: {
        'xxs': '4px',
        'xs': '6px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        'xxl': '24px',
        'xxxl': '32px',
      },
      fontSize: {
        'h1': ['28px', { lineHeight: '1.3', fontWeight: '600' }],
        'h2': ['22px', { lineHeight: '1.35', fontWeight: '600' }],
        'h3': ['18px', { lineHeight: '1.4', fontWeight: '500' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-bold': ['14px', { lineHeight: '1.4', fontWeight: '500' }],
        'label': ['12px', { lineHeight: '1.3', fontWeight: '500' }],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
