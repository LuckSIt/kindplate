import { expect, test } from "@playwright/test";

test.describe("Landing hero typography", () => {
    test("badges and labels use enlarged font sizes", async ({ page }) => {
        await page.goto("/");

        const profitable = page.getByTestId("hero-profitable");
        const useful = page.getByTestId("hero-useful");
        const forYou = page.getByTestId("hero-for-you");
        const forPlanet = page.getByTestId("hero-for-planet");

        await expect(profitable).toHaveText("Выгодно");
        await expect(useful).toHaveText("полезно");
        await expect(forYou).toHaveText("для тебя,");
        await expect(forPlanet).toHaveText("для планеты");

        const sizes = await Promise.all([
            profitable.evaluate((el) => getComputedStyle(el).fontSize),
            useful.evaluate((el) => getComputedStyle(el).fontSize),
            forYou.evaluate((el) => getComputedStyle(el).fontSize),
            forPlanet.evaluate((el) => getComputedStyle(el).fontSize),
        ]);

        for (const size of sizes) {
            expect(Number.parseFloat(size)).toBeGreaterThanOrEqual(26);
        }
    });
});

