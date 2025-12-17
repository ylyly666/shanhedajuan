import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // 代理配置（如果需要解决CORS问题）
        proxy: {
          '/api/silicoflow': {
            target: 'https://api.siliconflow.cn',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/silicoflow/, '/v1'),
          },
        },
      },
      plugins: [react()],
      define: {
        // 兼容旧代码（使用process.env）
        'process.env.API_KEY': JSON.stringify(env.SILICOFLOW_API_KEY || env.VITE_SILICOFLOW_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY),
        'process.env.SILICOFLOW_API_KEY': JSON.stringify(env.SILICOFLOW_API_KEY || env.VITE_SILICOFLOW_API_KEY),
        'process.env.SILICOFLOW_BASE_URL': JSON.stringify(env.SILICOFLOW_BASE_URL || env.VITE_SILICOFLOW_BASE_URL),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
        'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY || env.VITE_OPENAI_API_KEY),
        // Vite环境变量（使用import.meta.env）
        'import.meta.env.VITE_SILICOFLOW_API_KEY': JSON.stringify(env.VITE_SILICOFLOW_API_KEY || env.SILICOFLOW_API_KEY),
        'import.meta.env.VITE_SILICOFLOW_BASE_URL': JSON.stringify(env.VITE_SILICOFLOW_BASE_URL || env.SILICOFLOW_BASE_URL),
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
