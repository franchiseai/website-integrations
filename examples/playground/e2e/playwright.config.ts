import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  fullyParallel: true,
  workers: 2,
  retries: 0,
  use: { baseURL: 'http://localhost:3012', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    cwd: '..',
    url: 'http://localhost:3012',
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
