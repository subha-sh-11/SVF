import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // themeable semantic tokens (see globals.css)
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        muted: "var(--muted)",
        chip: "var(--chip)",
        line: "var(--line)",
        strong: "var(--text-strong)",
        body: "var(--text-body)",
        faint: "var(--text-faint)",
        sidebar: "var(--sidebar)",
        "sidebar-fg": "var(--sidebar-fg)",
        tbl: "var(--table-bg)",
        "tbl-head": "var(--table-head)",
        "tbl-stripe": "var(--table-stripe)",
        "tbl-line": "var(--table-line)",
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
        },
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)",
        pop: "0 12px 40px -12px rgba(0,0,0,0.28)",
      },
    },
  },
  plugins: [],
};
export default config;
