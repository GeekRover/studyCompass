import type { Config } from "tailwindcss";

function token(name: string) {
  return `hsl(var(--${name}) / <alpha-value>)`;
}

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: token("background"),
        surface: {
          DEFAULT: token("surface"),
          muted: token("surface-muted")
        },
        border: token("border"),
        input: token("input"),
        ring: token("ring"),
        foreground: {
          DEFAULT: token("foreground"),
          muted: token("muted-foreground"),
          subtle: token("subtle-foreground")
        },
        primary: {
          DEFAULT: token("primary"),
          foreground: token("primary-foreground"),
          muted: token("primary-muted")
        },
        accent: {
          DEFAULT: token("accent"),
          foreground: token("accent-foreground"),
          muted: token("accent-muted")
        },
        success: {
          DEFAULT: token("success"),
          muted: token("success-muted")
        },
        warning: {
          DEFAULT: token("warning"),
          muted: token("warning-muted")
        },
        danger: {
          DEFAULT: token("danger"),
          muted: token("danger-muted")
        },
        info: {
          DEFAULT: token("info"),
          muted: token("info-muted")
        },
        deep: {
          DEFAULT: token("deep"),
          foreground: token("deep-foreground")
        }
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 4px)"
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          '"Segoe UI"',
          "Arial",
          "sans-serif"
        ],
        display: [
          '"Bricolage Grotesque Variable"',
          '"Inter Variable"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif"
        ]
      },
      boxShadow: {
        sm: "0 1px 2px 0 hsl(234 22% 12% / 0.05)",
        md: "0 4px 12px -2px hsl(234 22% 12% / 0.08), 0 2px 4px -2px hsl(234 22% 12% / 0.05)",
        lg: "0 12px 32px -8px hsl(234 22% 12% / 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
