module.exports = {
  purge: {
    enabled: true,
    mode: 'all',
    preserveHtmlElements: false,
    content: ['./src/*.html'],
  },
  darkMode: false,
  theme: {
    extend: {
      colors: {
        lightblue: '#f0f8ff',
        blue: '#007fa3',
        red: '#d71433',
      },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
