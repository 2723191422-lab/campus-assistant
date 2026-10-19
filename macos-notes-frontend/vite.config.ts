import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// 开发时把同源 /api 请求转发给 FastAPI；生产部署需另外配置反向代理。
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'ROCK_');
  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1', port: 5173, strictPort: true,
      proxy: { '/api': { target: env.ROCK_API_TARGET || 'http://127.0.0.1:8000' } },
    },
  };
});
