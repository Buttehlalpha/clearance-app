/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        sans: ['"Work Sans"', 'sans-serif'],
      },
      colors: {
        cream: '#F6F4EF',
        ink: '#1C2430',
        navy: {
          DEFAULT: '#1E3A5F',
          dark: '#152A45',
          light: '#2E5281',
        },
        amber: {
          DEFAULT: '#D98E34',
          dark: '#B8742A',
          light: '#E8AD6B',
        },
        sage: '#CBD8D8',
        line: '#E2DFD5',
        success: '#2F8F5B',
        danger: '#C44D3C',
      },
      maxWidth: {
        content: '1180px',
      },
    },
  },
  plugins: [],
}
