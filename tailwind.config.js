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
        blue: '#07a',
        red: '#d13',
      },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
