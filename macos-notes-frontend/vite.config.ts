import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite 仅负责前端开发和构建；这里没有 API 服务或数据库代理。
export default defineConfig({ plugins: [react()], server: { host: '127.0.0.1', port: 5173, strictPort: true } });
