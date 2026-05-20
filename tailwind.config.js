/** @type {import('tailwindcss').Config} */

const rgbVar = (name) => `rgb(var(${name}) / <alpha-value>)`

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        playfair: ['var(--font-playfair)', 'Playfair Display', 'serif'],
      },
      colors: {
        forest: {
          primary: rgbVar('--color-forest-primary'),
          'primary-dark': rgbVar('--color-forest-primary-dark'),
          background: rgbVar('--color-forest-background'),
          accent: rgbVar('--color-forest-accent'),
          'accent-dark': rgbVar('--color-forest-accent-dark'),
        },
        sanctuary: {
          primary: rgbVar('--color-sanctuary-primary'),
          'primary-dark': rgbVar('--color-sanctuary-primary-dark'),
          background: rgbVar('--color-sanctuary-background'),
          accent: rgbVar('--color-sanctuary-accent'),
          'accent-dark': rgbVar('--color-sanctuary-accent-dark'),
        },
        text: {
          DEFAULT: rgbVar('--color-text'),
          light: rgbVar('--color-text-light'),
          muted: rgbVar('--color-text-muted'),
          inverse: rgbVar('--color-text-inverse'),
        },
        surface: {
          DEFAULT: rgbVar('--color-surface'),
          raised: rgbVar('--color-surface-raised'),
        },
        'on-brand': {
          DEFAULT: rgbVar('--color-on-brand'),
          muted: rgbVar('--color-on-brand-muted'),
        },
        'brand-band': {
          DEFAULT: rgbVar('--color-brand-band'),
          dark: rgbVar('--color-brand-band-dark'),
        },
        border: {
          DEFAULT: rgbVar('--color-border'),
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
