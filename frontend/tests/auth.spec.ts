import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'rohanunbeg');
    await page.fill('#password', 'Super@Rohan2025!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 30000 });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid credentials')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('#username', 'rohanunbeg');
    await page.fill('#password', 'Super@Rohan2025!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Logout
    await page.click('button[title="Logout"]');
    await expect(page).toHaveURL('/login');
  });
});
