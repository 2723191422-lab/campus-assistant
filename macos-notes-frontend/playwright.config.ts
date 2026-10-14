import { defineConfig } from '@playwright/test';

// 使用本机 Chrome；测试只访问纯前端 mock，不涉及个人数据或真实 API。
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 1000 } },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
  reporter: 'list'
});
