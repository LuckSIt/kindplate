import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 120_000,
    expect: {
        timeout: 5_000,
    },
    reporter: "list",
    use: {
        baseURL: "http://localhost:4173",
        headless: true,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: {
                ...devices["Desktop Chrome"],
                viewport: { width: 390, height: 844 },
            },
        },
    ],
    webServer: {
        command: "npm run dev -- --host --port 4173",
        url: "http://localhost:4173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});

