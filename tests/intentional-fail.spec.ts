import { test, expect } from '@playwright/test';

// ⚠️ INTENTIONALLY FAILING — demo only. Delete this file before committing /
// running CI; it exists purely to show what a failed result looks like.
test.describe('Intentional failure (demo)', () => {
  test('this assertion is designed to fail', async ({ page }) => {
    await page.goto('/');

    // The hero heading is "Unlock the World Through English", so asserting a
    // different string makes this test fail on purpose.
    await expect(
      page.getByRole('heading', { name: 'This heading does not exist' }),
    ).toBeVisible({ timeout: 3000 });
  });
});
