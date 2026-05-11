import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: "hsl(var(--background))",
  			foreground: "hsl(var(--foreground))",
  			card: {
  				DEFAULT: "hsl(var(--card))",
  				foreground: "hsl(var(--card-foreground))"
  			},
  			popover: {
  				DEFAULT: "hsl(var(--popover))",
  				foreground: "hsl(var(--popover-foreground))"
  			},
  			primary: {
  				DEFAULT: "hsl(var(--primary))",
  				foreground: "hsl(var(--primary-foreground))"
  			},
  			secondary: {
  				DEFAULT: "hsl(var(--secondary))",
  				foreground: "hsl(var(--secondary-foreground))"
  			},
  			muted: {
  				DEFAULT: "hsl(var(--muted))",
  				foreground: "hsl(var(--muted-foreground))"
  			},
  			accent: {
  				DEFAULT: "hsl(var(--accent))",
  				foreground: "hsl(var(--accent-foreground))"
  			},
  			destructive: {
  				DEFAULT: "hsl(var(--destructive))",
  				foreground: "hsl(var(--destructive-foreground))"
  			},
  			border: "hsl(var(--border))",
  			input: "hsl(var(--input))",
  			ring: "hsl(var(--ring))",
  			chart: {
  				"1": "hsl(var(--chart-1))",
  				"2": "hsl(var(--chart-2))",
  				"3": "hsl(var(--chart-3))",
  				"4": "hsl(var(--chart-4))",
  				"5": "hsl(var(--chart-5))"
  			},
  			midnight: "#0A0F1E",
  			surface: "#111827",
  			"border-alt": "#1F2937",
  			"accent-blue": "#3B82F6",
  			"accent-amber": "#F59E0B",
  			"success-green": "#10B981",
  			"danger-red": "#EF4444",
  			"off-white": "#F9FAFB",
  			"muted-grey": "#9CA3AF"
  		},
  		borderRadius: {
  			lg: "var(--radius)",
  			md: "calc(var(--radius) - 2px)",
  			sm: "calc(var(--radius) - 4px)",
  			xl: "12px",
  			"2xl": "16px",
  			"3xl": "24px"
  		},
  		fontFamily: {
  			heading: ["var(--font-sora)", "sans-serif"],
  			body: ["var(--font-inter)", "sans-serif"]
  		},
  		keyframes: {
  			"ticker": {
  				"0%": { transform: "translateX(0)" },
  				"100%": { transform: "translateX(-50%)" }
  			},
  			"float": {
  				"0%, 100%": { transform: "translateY(0)" },
  				"50%": { transform: "translateY(-10px)" }
  			},
  			"fade-in-up": {
  				"0%": { opacity: "0", transform: "translateY(20px)" },
  				"100%": { opacity: "1", transform: "translateY(0)" }
  			},
  			"progress-fill": {
  				"0%": { width: "0%" },
  				"100%": { width: "var(--progress-width)" }
  			},
  			"shimmer": {
  				"100%": { transform: "translateX(100%)" }
  			}
  		},
  		animation: {
  			"ticker": "ticker 30s linear infinite",
  			"float": "float 3s ease-in-out infinite",
  			"fade-in-up": "fade-in-up 0.6s ease-out forwards",
  			"progress-fill": "progress-fill 1s ease-out forwards",
  			"shimmer": "shimmer 2.5s infinite"
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
