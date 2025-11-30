import { test, expect } from '@playwright/test';

test.describe('Fee Collection', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'rohanunbeg');
    await page.fill('#password', 'Super@Rohan2025!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 30000 });
  });

  test('should navigate to fee collection', async ({ page }) => {
    await page.click('nav >> text=Fee Collection');
    await expect(page).toHaveURL('/fee-collection');
    await expect(page.locator('text=Fee Collection')).toBeVisible();
  });
});
