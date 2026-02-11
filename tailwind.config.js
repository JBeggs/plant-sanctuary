/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        'playfair': ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        // Plant Sanctuary - Nature/Green Theme
        forest: {
          primary: '#228B22',       // Forest Green
          'primary-dark': '#1B6B1B',
          background: '#F5F5DC',   // Beige/Cream
          accent: '#8B4513',       // Terracotta
          'accent-dark': '#6B3410',
        },
        sanctuary: {
          primary: '#2E7D32',      // Slightly darker green
          'primary-dark': '#1B5E20',
          background: '#FAFAFA',   // Off-white
          accent: '#A0522D',       // Sienna
          'accent-dark': '#6B3529',
        },
        text: {
          DEFAULT: '#333333',
          light: '#666666',
          muted: '#999999',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
