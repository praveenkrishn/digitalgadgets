/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        mist: "#f6f7fb",
        ember: "#f97316",
        aqua: "#0ea5e9",
        night: "#08101f",
        sunrise: "#fff1d6"
      },
      fontFamily: {
        display: ["Space Grotesk", "Segoe UI", "sans-serif"],
        body: ["DM Sans", "Segoe UI", "sans-serif"]
      },
      boxShadow: {
        glow: "0 20px 60px rgba(14, 165, 233, 0.18)",
        card: "0 20px 40px rgba(15, 23, 42, 0.08)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0px)" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        fadeUp: "fadeUp 0.55s ease-out"
      }
    }
  },
  plugins: []
};
