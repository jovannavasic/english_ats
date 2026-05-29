import { test, expect } from '@playwright/test';

test.describe('Main navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'Unlock the World Through English' }),
    ).toBeVisible();
  });

  const headerNav = (page: import('@playwright/test').Page) =>
    page.getByRole('navigation').filter({
      has: page.getByRole('button', { name: 'Stojanka Mirković' }),
    });

  test('renders all 7 nav menu buttons in the header', async ({ page }) => {
    const nav = headerNav(page);

    for (const name of [
      'Home',
      'About',
      'Why English',
      'Lessons',
      'Gallery',
      'Testimonials',
      'Contact',
    ]) {
      await expect(nav.getByRole('button', { name, exact: true })).toBeVisible();
    }
  });

  test('clicking the Contact nav button scrolls the Contact section into view', async ({
    page,
  }) => {
    await headerNav(page).getByRole('button', { name: 'Contact', exact: true }).click();

    await expect(page.locator('#contact')).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: 'Get in Touch', level: 2 }),
    ).toBeInViewport();
  });

  test('"Get in Touch" CTA scrolls to the Contact section', async ({ page }) => {
    await page.getByRole('button', { name: 'Get in Touch', exact: true }).click();

    await expect(page.locator('#contact')).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: 'Get in Touch', level: 2 }),
    ).toBeInViewport();
  });

  test('"Learn More" CTA scrolls to the Lessons section', async ({ page }) => {
    await page.getByRole('button', { name: 'Learn More', exact: true }).click();

    await expect(page.locator('#lessons')).toBeInViewport();
    await expect(
      page.getByRole('heading', { name: 'Lessons & Services', level: 2 }),
    ).toBeInViewport();
  });
});
