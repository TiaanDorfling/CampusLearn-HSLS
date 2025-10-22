/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["Lato", "ui-sans-serif", "system-ui"],
        sans: ["Montserrat", "ui-sans-serif", "system-ui"],
        button: ["Poppins", "ui-sans-serif", "system-ui"],
      },
      colors: {
        campus: {
          purple: "#4B2061",
          pink: "#F18CB3",
          lavender: "#B9AEE5",
          cream: "#FFF3E0",
          redbrown: "#9D4B3C",
          beige: "#E9D9B5",
          "purple-dark": "#b78ef2",
          "lavender-dark": "#d5ccf5",
          "cream-dark": "#1f1b24",
          "redbrown-dark": "#cc6a56",
          "beige-dark": "#2b2732",
        },
      },
    },
  },
  plugins: [],
};
