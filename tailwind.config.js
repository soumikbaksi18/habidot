/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        runs: ['TTRuns', 'sans-serif'],
        interBold: ['InterBold', 'sans-serif'],
        interLight: ['InterLight', 'sans-serif'],
        interMedium: ['InterMedium', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        interSemiBold: ['InterSemiBold', 'sans-serif'],
        ttRunsTrialMedium: ["TTRunsTrialMedium", "sans-serif"],
        ttRunsTrialRegular: ["TTRunsTrialRegular", "sans-serif"],
      },
    },
  },
  plugins: [],
}

