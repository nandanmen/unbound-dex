import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          1: "var(--gray-1)",
          2: "var(--gray-2)",
          3: "var(--gray-3)",
          4: "var(--gray-4)",
          5: "var(--gray-5)",
          6: "var(--gray-6)",
          7: "var(--gray-7)",
          8: "var(--gray-8)",
          9: "var(--gray-9)",
          10: "var(--gray-10)",
          11: "var(--gray-11)",
          12: "var(--gray-12)",
        },
        grayA: {
          1: "var(--gray-a1)",
          2: "var(--gray-a2)",
          3: "var(--gray-a3)",
          4: "var(--gray-a4)",
          5: "var(--gray-a5)",
          6: "var(--gray-a6)",
          7: "var(--gray-a7)",
          8: "var(--gray-a8)",
          9: "var(--gray-a9)",
          10: "var(--gray-a10)",
          11: "var(--gray-a11)",
          12: "var(--gray-a12)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
