module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  daisyui: {
    themes: [
      "dark",
      "synthwave",
      "forest",
      "black",
      "luxury",
      "halloween",
      "business",
      "dracula",
      "night",
      "retro",
      "coffee",
      "light",
      "lofi",
      "cmyk",
      "cyberpunk",
      "valentine",
      "cupcake",
      "winter",
      "lemonade",
      "corporate"
    ]
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")]
};
