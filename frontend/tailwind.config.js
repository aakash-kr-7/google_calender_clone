/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'gcal-blue':       '#1a73e8',
        'gcal-blue-hover': '#1557b0',
        'gcal-red':        '#d93025',
        'gcal-text':       '#3c4043',
        'gcal-light':      '#70757a',
        'gcal-border':     '#dadce0',
        'gcal-bg':         '#f6f8fc',
        'gcal-surface':    '#ffffff',
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
