/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C1810',
        secondary: '#D4A574',
        accent: '#8B4513',
        cream: '#FFF8F0',
        warm: '#F5E6D3',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      backgroundImage: {
        'gradient-cafe': 'linear-gradient(135deg, #2C1810 0%, #5C3D2E 100%)',
      }
    },
  },
  plugins: [],
};
