import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: '#0a0b0d',
        panel: '#121316',
        panel2: '#17181c',
        edge: '#26282e',
        ink: '#e7e9ee',
        sub: '#9aa0ab',
        faint: '#6b7078',
        accent: '#7170ff',
        accentSoft: 'rgba(113, 112, 255, 0.12)',
        good: '#3ecf8e',
        warn: '#f2c94c',
        bad: '#ff6b6b',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'system-ui', 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Consolas', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
