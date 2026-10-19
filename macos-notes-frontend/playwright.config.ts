import { defineConfig } from '@playwright/test';

// 每项测试使用独立临时SQLite和真实FastAPI；不复用个人服务或数据库。
export default defineConfig({
  testDir: './tests', fullyParallel: false, workers: 1,
  use: { baseURL: 'http://127.0.0.1:15173', browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 1000 } },
  webServer: {
    command: 'npm run dev -- --port 15173', url: 'http://127.0.0.1:15173', reuseExistingServer: false,
    env: { ROCK_API_TARGET: 'http://127.0.0.1:18000' },
  },
  reporter: 'list'
});
