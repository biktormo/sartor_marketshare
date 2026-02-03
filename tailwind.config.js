/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#367C2B",
          secondary: "#FFDE00",
          accent: "#30ec13",
        },
      },
    },
    plugins: [],
  }