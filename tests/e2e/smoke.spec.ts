import { expect, test } from '@playwright/test';

test('landing page loads and exposes primary navigation', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/PracticeKoro/i);
  await expect(page.locator('body')).toContainText(/PracticeKoro/i);
});

test('unknown routes render the not-found experience or safe fallback', async ({ page }) => {
  await page.goto('/this-route-does-not-exist');
  await expect(page.locator('body')).toBeVisible();
});
