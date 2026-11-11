/** @type {import('tailwindcss').Config} */
module.exports = {
  // QUAN TRỌNG: dạng ['selector', 'a, b, c'] của Tailwind sinh ra `:where(a, b, c .dark *)` -> chỉ khớp chính phần tử
  // <html data-theme=...> chứ KHÔNG khớp phần tử con, khiến mọi biến thể `dark:` chết trong theme tối.
  // Dùng 'variant' với selector tự viết để `dark:` khớp cả <html> lẫn mọi hậu duệ của theme tối (không theo OS).
  // Sepia là theme SÁNG-ẤM (giấy ngà) nên KHÔNG nằm trong danh sách; nó dùng adaptor `[data-theme="sepia"]` trong globals.css.
  darkMode: ['variant', [
    '&:where([data-theme="obsidian"], [data-theme="obsidian"] *, [data-theme="cyberpunk"], [data-theme="cyberpunk"] *, .dark, .dark *)',
  ]],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Be Vietnam Pro"',
          '"Plus Jakarta Sans"',
          '"Inter"',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          '"Lora"',
          '"Be Vietnam Pro"',
          '"Merriweather"',
          'Georgia',
          'Cambria',
          'serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-4px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(4px)' },
        },
        pulseRed: {
          '0%, 100%': { opacity: '0.1' },
          '50%': { opacity: '0.35' },
        }
      },
      animation: {
        shake: 'shake 0.45s cubic-bezier(.36,.07,.19,.97) both',
        pulseRed: 'pulseRed 2s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};

