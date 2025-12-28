import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
  ],
  theme: {
    extend: {
      colors: {
        // 新中式配色系统
        paper: '#F7F4ED',        // 宣纸背景
        ink: {
          DEFAULT: '#2C2C2C',    // 墨色文字
          light: 'rgba(44, 44, 44, 0.1)', // 淡墨（10%透明度）
          medium: 'rgba(44, 44, 44, 0.3)', // 中墨（30%透明度）
        },
        'primary-red': '#B94047', // 朱红
        'accent-green': '#567C73', // 石绿
      },
      fontFamily: {
        serif: ['Noto Serif SC', 'STSong', 'SimSun', 'serif'], // 标题衬线体
        sans: ['Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'sans-serif'], // 正文无衬线体
      },
      backgroundImage: {
        'paper-texture': `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E")`,
        'mountain-silhouette': `url("data:image/svg+xml,%3Csvg width='1200' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,400 L200,300 L400,320 L600,280 L800,300 L1000,250 L1200,280 L1200,400 Z' fill='%232C2C2C' opacity='0.03'/%3E%3Cpath d='M0,400 L150,350 L300,360 L450,340 L600,360 L750,320 L900,340 L1050,300 L1200,320 L1200,400 Z' fill='%232C2C2C' opacity='0.02'/%3E%3C/svg%3E")`,
      },
      boxShadow: {
        'paper': '0 2px 8px rgba(44, 44, 44, 0.08)',
        'paper-lg': '0 4px 16px rgba(44, 44, 44, 0.12)',
        'ink': '0 2px 4px rgba(44, 44, 44, 0.1)',
      },
      borderRadius: {
        'chinese': '0.375rem', // rounded-md
      },
      animation: {
        'ink-splash': 'inkSplash 0.6s ease-out',
        'stamp': 'stamp 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'fade-in': 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        inkSplash: {
          '0%': { transform: 'scale(0)', opacity: '0.8' },
          '50%': { transform: 'scale(1.2)', opacity: '0.6' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
        stamp: {
          '0%': { transform: 'scale(0) rotate(-10deg)', opacity: '0' },
          '50%': { transform: 'scale(1.1) rotate(5deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;


