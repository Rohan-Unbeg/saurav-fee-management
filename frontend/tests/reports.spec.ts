import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('#username', 'rohanunbeg');
    await page.fill('#password', 'Super@Rohan2025!');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15000 });
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 30000 });
  });

  test('should load reports page and tabs', async ({ page }) => {
    await page.click('nav >> text=Reports');
    await expect(page).toHaveURL('/reports');
    
    await expect(page.locator('button:has-text("Defaulters")')).toBeVisible();
    await expect(page.locator('button:has-text("Batch-wise")')).toBeVisible();
    await expect(page.locator('button:has-text("Collection")')).toBeVisible();
  });

  test('should filter by batch', async ({ page }) => {
    await page.click('nav >> text=Reports');
    await page.click('button:has-text("Batch-wise")');
    await expect(page.locator('input[placeholder*="Batch Name"]')).toBeVisible();
    
    await page.fill('input[placeholder*="Batch Name"]', 'Test Batch');
    // Wait for debounce
    await page.waitForTimeout(1000);
    // Verify results (mock check or check for specific element)
  });
});
