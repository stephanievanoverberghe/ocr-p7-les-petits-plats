const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html, js}",
    "./*.{html, js}",
    "./pages/*.{html, js}"
  ],
  theme: {
    // A l'extérieur, ça remplace les fonctionnalités se trouvant dans le thème tailwind
    extend: {
      // A l'intérieur, ça ajoute des fonctionnalités au thème tailwind sans rien écraser
      colors: {
        'color-site': {
          50: '#ffd15b',
          100: '#1b1b1b',
          200: '#ededed',
          300: '#7a7a7a'
        }
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

