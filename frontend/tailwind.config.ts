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
        // ---- Representative app tokens (scoped via .rep-root in rep.css) ----
        page: "var(--color-page)",
        "surface-muted": "var(--color-surface-muted)",
        "line-strong": "var(--color-line-strong)",
        ink: {
          DEFAULT: "var(--color-ink)",
          soft: "var(--color-ink-soft)",
          faint: "var(--color-ink-faint)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
          ink: "var(--color-accent-ink)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          soft: "var(--color-success-soft)",
          ink: "var(--color-success-ink)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          soft: "var(--color-warning-soft)",
          ink: "var(--color-warning-ink)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          soft: "var(--color-danger-soft)",
          ink: "var(--color-danger-ink)",
        },
      },
      fontFamily: {
        num: ['"Roboto Mono"', "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      maxWidth: {
        app: "68rem",
      },
      boxShadow: {
        card: "0 1px 2px 0 rgba(0,0,0,0.04), 0 1px 3px 0 rgba(0,0,0,0.06)",
        pop: "0 12px 40px -12px rgba(0,0,0,0.28)",
        focus: "0 0 0 3px var(--color-accent-soft)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-10px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "pop-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out both",
        "slide-up": "slide-up 0.3s ease-out both",
        "toast-in": "toast-in 0.25s cubic-bezier(0.16,1,0.3,1) both",
        "pop-in": "pop-in 0.2s ease-out both",
      },
    },
  },
  plugins: [],
};
export default config;
