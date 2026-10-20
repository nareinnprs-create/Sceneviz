/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./app/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./packages/studio/src/**/*.{js,jsx}",
        "./packages/Open-AI-Design-Agent/packages/design-agent/src/**/*.{js,jsx}",
        "./packages/Open-Poe-AI/packages/agents/src/**/*.{js,jsx,ts,tsx}",
        "./packages/Vibe-Workflow/packages/workflow-builder/src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#16C5D0',
                    hover: '#0E9AA5',
                },
                'app-bg': '#101319',
                'panel-bg': '#171C24',
                'card-bg': '#1E242D',
                secondary: '#818996',
                muted: '#5B6472',
                'bg-page': 'rgb(var(--bg-page) / <alpha-value>)',
                'bg-card': 'rgb(var(--bg-card) / <alpha-value>)',
                'bg-card-hover': 'rgb(var(--bg-card-hover) / <alpha-value>)',
                'bg-elevated': 'rgb(var(--bg-elevated) / <alpha-value>)',
                'primary-text': 'rgb(var(--text-primary) / <alpha-value>)',
                'secondary-text': 'rgb(var(--text-secondary) / <alpha-value>)',
                'accent-text': 'rgb(var(--text-accent, 22 197 208) / <alpha-value>)',
                divider: 'var(--border-subtle)',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
                mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            boxShadow: {
                'glow': '0 0 20px rgba(22, 197, 208, 0.4)',
                'glow-sm': '0 0 10px rgba(22, 197, 208, 0.35)',
                'glow-accent': '0 0 20px rgba(8, 127, 145, 0.4)',
                '3xl': '0 35px 60px -15px rgba(0, 0, 0, 0.8)',
            }
        },
    },
    plugins: [],
}
