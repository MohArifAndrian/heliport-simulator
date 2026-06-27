/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#004080",
          dark: "#003366",
          darker: "#002244",
          light: "#0066cc",
        },
        accent: {
          DEFAULT: "#FFCC00",
          dark: "#E6B800",
          foreground: "#002244",
        },
        portal: {
          cyan: "#00CCFF",
          lime: "#33FF99",
          surface: "#F4F4F4",
          chart: "#1A1A1A",
        },
      },
      fontFamily: {
        sans: ["Montserrat", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        portal: "0 2px 12px rgba(0, 36, 68, 0.08)",
        "portal-lg": "0 8px 24px rgba(0, 36, 68, 0.12)",
      },
    },
  },
  plugins: [],
};
