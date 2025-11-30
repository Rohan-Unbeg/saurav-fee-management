import { test, expect } from '@playwright/test';

test('should load students API only once on navigation', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('#username', 'rohanunbeg');
  await page.fill('#password', 'Super@Rohan2025!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/', { timeout: 30000 });

  // Monitor network requests
  let requestCount = 0;
  page.on('request', request => {
    if (request.url().includes('/api/students') && request.method() === 'GET') {
      requestCount++;
      console.log(`Request made: ${request.url()}`);
    }
  });

  // Navigate to Students
  await page.click('nav >> text=Students');
  
  // Wait for the table to load (implies fetch is done)
  await expect(page.locator('table')).toBeVisible();
  
  // Wait a bit more to ensure no delayed debounce calls
  await page.waitForTimeout(1000);

  console.log(`Total requests to /api/students: ${requestCount}`);
  
  // Assert
  expect(requestCount).toBe(1);
});
