/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        purple: "#8D52FE",
        purplehover: "#966FD6",
        yellow: "#FD9051",
        grey: "#8697C4",
        grey1: "#ADBBDA",
        pink: "#CA749D",
        red: "#FF0000",
      },
      fontFamily: {
        primary: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        "purple-yellow-gradient": "linear-gradient(to right, #8D52FE, #FD9051)",
      },
      keyframes: {
        scroll: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        scroll: "scroll 20s linear infinite",
      },
    },
  },
  plugins: [require('daisyui')],
};
