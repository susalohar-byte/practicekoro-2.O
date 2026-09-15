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

test('student can discover a topic test and open the runner in demo mode', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: /Student Account/i }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/practice');
  await page.getByRole('button', { name: /Topic Tests/i }).click();
  await page.getByRole('button', { name: /Indian History/i }).click();
  await page.getByRole('button', { name: /Indus Valley Civilization/i }).click();
  await page
    .getByRole('button', { name: /View Test/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/exams\/test-indus-01$/);
  await page.getByRole('button', { name: /Start Test Now/i }).click();
  await expect(page).toHaveURL(/\/exams\/test-indus-01\/runner\?attemptId=/);
  await expect(page.getByText(/Question 1/i).first()).toBeVisible();
});
