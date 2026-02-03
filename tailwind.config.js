/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          primary: "#367C2B", // Verde John Deere
          secondary: "#FFDE00", // Amarillo John Deere
          accent: "#30ec13", // Verde brillante de los bocetos
        },
      },
    },
    plugins: [],
  }