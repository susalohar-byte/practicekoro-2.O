import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and exposes primary navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PracticeKoro/i);
    await expect(page.locator('body')).toContainText(/PracticeKoro/i);
  });

  test('renders hero headline and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started', exact: true })).toBeVisible();
  });

  test('exam catalog section filters by search query', async ({ page }) => {
    await page.goto('/');
    const search = page.getByPlaceholder('Search exams...');
    await expect(search).toBeVisible();

    await search.fill('WBP');
    await expect(page.getByText('WBP Constable', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Railway (RRB)')).toHaveCount(0);

    // empty state with a way out
    await search.fill('zzz-no-match');
    await expect(page.getByText('No exams match')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByText('Railway (RRB)')).toBeVisible();
  });
});

test.describe('FAQ accordion', () => {
  test('first question open by default, exclusive-open and re-click toggle', async ({ page }) => {
    await page.goto('/');
    const faqButtons = page.locator('section:has-text("Frequently Asked Questions") button');
    const first = faqButtons.nth(0);
    const second = faqButtons.nth(1);

    await expect(first).toContainText('Mistakes Notebook');
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    // First answer must have collapsed when the second opened
    await expect(first).toHaveAttribute('aria-expanded', 'false');

    // Re-click closes it
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'false');
  });
});

test.describe('Routing guards', () => {
  test('unknown routes render the app shell fallback without crashing', async ({ page }) => {
    await page.goto('/this-route-does-not-exist');
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveTitle(/PracticeKoro/i);
  });

  test('protected route redirects anonymous users to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('admin route redirects anonymous users to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});
