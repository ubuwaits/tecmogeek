import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3105",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm exec serve out -l 3105",
    port: 3105,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
