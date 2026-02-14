npx tailwindcss -i ./src/index.css -o ./public/tailwind.cssnpx tailwindcss -i ./src/index.css -o ./public/tailwind.css --watch// Standard PostCSS config for Tailwind + Autoprefixer
// Restored to the common setup so Vite/PostCSS can load it normally.
module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
