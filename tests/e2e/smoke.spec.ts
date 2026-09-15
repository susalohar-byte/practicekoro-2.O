import { expect, test } from '@playwright/test';

test.describe('Landing page', () => {
  test('loads and exposes primary navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PracticeKoro/i);
    await expect(page.locator('body')).toContainText(/PracticeKoro/i);
  });

  test('renders hero headline and dual CTAs', async ({ page }) => {
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
    const firstCardTitle = page.locator('section:has(#pricing) h3').first();
    // WBP Constable must survive the filter; Railway/SSC GD must not be visible
    await expect(page.getByText('WBP Constable', { exact: false }).first()).toBeVisible();
    await expect(page.getByText('Railway (RRB)')).toHaveCount(0);

    await search.fill('zzz-no-match');
    await expect(firstCardTitle).toHaveCount(0);
  });
});

test.describe('FAQ accordion', () => {
  test('expands exactly one answer at a time and toggles closed on re-click', async ({ page }) => {
    await page.goto('/');
    const faqButtons = page.locator('section:has-text("Frequently Asked Questions") button');
    const first = faqButtons.nth(0);
    const second = faqButtons.nth(1);

    await expect(first).toContainText('Mistakes Notebook');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');

    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    // First answer must have collapsed when the second opened
    await expect(first).toHaveAttribute('aria-expanded', 'false');
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
