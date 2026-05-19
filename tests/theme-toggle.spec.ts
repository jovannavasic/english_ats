import { test, expect } from '@playwright/test';

test.describe('Dark / Light theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('page loads in light mode by default', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('clicking toggle activates dark mode', async ({ page }) => {
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Toggle dark mode' }).click();

    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('clicking toggle twice returns to light mode', async ({ page }) => {
    const toggle = page.getByRole('button', { name: 'Toggle dark mode' });

    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await toggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('dark mode persists while scrolling through sections', async ({ page }) => {
    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('html')).toHaveClass(/dark/);
  });

  test('background color changes between light and dark mode', async ({ page }) => {
    const body = page.locator('body');

    const lightBg = await body.evaluate(el => getComputedStyle(el).backgroundColor);

    await page.getByRole('button', { name: 'Toggle dark mode' }).click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    const darkBg = await body.evaluate(el => getComputedStyle(el).backgroundColor);

    expect(lightBg).not.toBe(darkBg);
  });
});
