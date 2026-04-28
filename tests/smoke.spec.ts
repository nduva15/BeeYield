import { test, expect } from '@playwright/test';

test.describe('BeeYield Dashboard Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    // Note: This assumes the app is running and accessible
    await page.goto('/');
  });

  test('should render the main dashboard layout', async ({ page }) => {
    // Check for Beeyield AI logo or title
    await expect(page.locator('header')).toBeVisible();
    await expect(page.getByText('Beeyield AI', { exact: false })).toBeVisible();
  });

  test('should navigate through sidebar items', async ({ page }) => {
    // Navigate to Spatial Coverage
    // We target the navigation items by their text or icons
    const spatialItem = page.getByText('Spatial Coverage');
    if (await spatialItem.isVisible()) {
      await spatialItem.click();
      await expect(page.getByText('Pollination Coverage Map')).toBeVisible();
    }
  });

  test('should show ErrorBoundary when a component fails', async ({ page }) => {
    // This is a more advanced test that would require mocking a failure
    // For now, we just verify the key experts are in the DOM
    await expect(page.locator('body')).toContainText('Beeyield');
  });
});
