import { test, expect } from '@playwright/test';

test.describe('Student Management', () => {
  test('should add a new student', async ({ page }) => {
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    
    // Login
    await page.goto('/login');
    await page.fill('#username', 'rohanunbeg');
    await page.fill('#password', 'Super@Rohan2025!');
    await page.fill('#password', 'Super@Rohan2025!');
    
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    await submitButton.click();
    
    // Check for potential error message
    const errorToast = page.locator('text=Login failed');
    if (await errorToast.isVisible()) {
      console.log('Login failed toast visible');
    }

    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL('/', { timeout: 30000 });
    await expect(page.locator('h2:has-text("Dashboard")')).toBeVisible({ timeout: 30000 });

    await page.click('nav >> text=Students');
    await page.click('button:has-text("New Admission")');

    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'Student');
    await page.fill('#studentMobile', '9999999999');
    await page.fill('#parentMobile', '8888888888');
    
    // Wait for courses to load (at least one course + default option)
    await expect(page.locator('#courseId option').nth(1)).toBeAttached({ timeout: 10000 });
    
    // Select Course (standard select)
    await page.selectOption('#courseId', { index: 1 });

    // Select Batch (Month and Year)
    // Target the selects inside the Batch container
    const batchContainer = page.locator('div.space-y-2:has(label:has-text("Batch"))');
    await batchContainer.locator('select').first().selectOption('January');
    await batchContainer.locator('select').last().selectOption('2025');

    await page.click('button:has-text("Admit Student")');
    
    // Verify student appears in the list (search to handle pagination)
    await page.fill('input[placeholder="Search students..."]', 'Test Student');
    await expect(page.locator('text=Test Student')).toBeVisible();
  });
});
