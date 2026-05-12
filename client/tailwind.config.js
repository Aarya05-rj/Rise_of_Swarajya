export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        saffron: "#FF9933",
        royalBrown: "#3E2723",
        gold: "#D4AF37",
        parchment: "#FFF7E8",
        ink: "#211714"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      boxShadow: {
        royal: "0 22px 60px rgba(62, 39, 35, 0.18)"
      }
    }
  },
  plugins: []
};
