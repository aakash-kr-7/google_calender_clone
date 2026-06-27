/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'gcal-blue':       'var(--color-gcal-blue, #1a73e8)',
        'gcal-blue-hover': 'var(--color-gcal-blue-hover, #1557b0)',
        'gcal-red':        'var(--color-gcal-red, #d93025)',
        'gcal-text':       'var(--color-gcal-text, #3c4043)',
        'gcal-light':      'var(--color-gcal-light, #70757a)',
        'gcal-border':     'var(--color-gcal-border, #dadce0)',
        'gcal-bg':         'var(--color-gcal-bg, #f6f8fc)',
        'gcal-surface':    'var(--color-gcal-surface, #ffffff)',
        'gcal-hover':      'var(--color-gcal-hover, #f1f3f4)',
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
