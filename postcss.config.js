// Use CommonJS to maximize compatibility with PostCSS/Vite loaders
let tailwind;
try {
  tailwind = require('@tailwindcss/postcss');
} catch (e) {
  // fallback to classic tailwind if the adapter isn't available
  tailwind = require('tailwindcss');
}

module.exports = {
  plugins: [
    tailwind(),
    require('autoprefixer')(),
  ],
};
