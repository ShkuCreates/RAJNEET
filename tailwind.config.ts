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
  			border: "rgba(255,255,255,0.05)",
  			input: "hsl(var(--input))",
  			ring: "#C0392B",
  			chart: {
  				"1": "hsl(var(--chart-1))",
  				"2": "hsl(var(--chart-2))",
  				"3": "hsl(var(--chart-3))",
  				"4": "hsl(var(--chart-4))",
  				"5": "hsl(var(--chart-5))"
  			},
  			"dark-black": "#080C14",
  			"dark-slate": "#0F1520",
  			"dark-charcoal": "#141C2B",
  			"blood-red": "#C0392B",
  			"dark-crimson": "#8B0000",
  			"muted-saffron": "#D4820A",
  			"off-white": "#E8E8E8",
  			"grey-blue": "#6B7A99",
  			"meta-blue": "#3D4F6B",
  			"alert-gold": "#B8860B"
  		},
  		borderRadius: {
  			lg: "0",
  			md: "0",
  			sm: "0"
  		},
  		fontFamily: {
  			bebas: ["var(--font-bebas)", "sans-serif"],
  			editorial: ["var(--font-playfair)", "serif"],
  			mono: ["var(--font-jetbrains)", "monospace"]
  		},
  		keyframes: {
  			"ticker": {
  				"0%": { transform: "translateX(0)" },
  				"100%": { transform: "translateX(-50%)" }
  			},
  			"fade-in-line": {
  				"0%": { opacity: "0", transform: "translateY(10px)" },
  				"100%": { opacity: "1", transform: "translateY(0)" }
  			},
  			"blink": {
  				"0%, 100%": { opacity: "1" },
  				"50%": { opacity: "0" }
  			}
  		},
  		animation: {
  			"ticker": "ticker 20s linear infinite",
  			"fade-in-line": "fade-in-line 0.4s ease-out forwards",
  			"blink": "blink 1s step-end infinite"
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
