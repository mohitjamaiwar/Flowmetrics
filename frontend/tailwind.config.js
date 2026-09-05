/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F1B2D",
        surface: "#F7F9FC",
        panel: "#0B1220",
        panelmuted: "#152238",
        teal: {
          DEFAULT: "#0E7C86",
          light: "#3FA5AE",
          dark: "#0A5C64",
        },
        blue: {
          DEFAULT: "#2F6FED",
          light: "#6B95F2",
        },
        line: "#E4E9EF",
        linedark: "#243347",
        muted: "#5B6B80",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      maxWidth: {
        content: "1180px",
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
