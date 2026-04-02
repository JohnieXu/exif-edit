/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", "Helvetica Neue", "Helvetica", "Segoe UI", "Arial", "Roboto", "PingFang SC", "miui", "Hiragino Sans GB", "Microsoft Yahei", "sans-serif"
        ]
      }
    },
  },
  plugins: [],
}
