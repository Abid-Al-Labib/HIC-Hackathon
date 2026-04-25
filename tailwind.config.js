/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        posthog: {
          parchment: "#fdfdf8",
          sage: "#eeefe9",
          "light-sage": "#e5e7e0",
          ink: "#4d4f46",
          "deep-ink": "#23251d",
          border: "#bfc1b7",
          orange: "#F54E00",
          cta: "#1e1f23"
        }
      },
      fontFamily: {
        sans: [
          "IBM Plex Sans Variable",
          "IBM Plex Sans",
          "-apple-system",
          "system-ui",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif"
        ]
      }
    }
  },
  plugins: []
};
