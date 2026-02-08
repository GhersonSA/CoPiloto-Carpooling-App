/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#090098",          // --color-primary web
        secondary: "#3b82f6",        // blue-500
        chofer: "#172554",           // azul oscuro para chofer (blue-950)
        pasajero: "#166534",         // verde oscuro para pasajero (green-700)
        "chofer-light": "#dbeafe",   // blue-100
        "pasajero-light": "#dcfce7", // green-100
        "blue-950": "#172554",
        "yellow-500": "#eab308",
      },
      fontFamily: {
        primary: ["Inter", "System"],
        secondary: ["Roboto", "System"],
      },
    },
  },
  plugins: [],
};
