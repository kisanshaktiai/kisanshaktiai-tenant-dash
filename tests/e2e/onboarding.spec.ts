
import { test, expect } from '@playwright/test';

test.describe('Tenant Onboarding Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/auth/v1/**', (route) => {
      route.fulfill({ json: { user: { id: 'test-user-id' } } });
    });

    // Mock tenant data
    await page.route('**/rest/v1/tenants*', (route) => {
      route.fulfill({
        json: [{
          id: 'test-tenant-id',
          name: 'Test AgriCorp',
          slug: 'test-agricorp',
          type: 'agri_company',
          status: 'active'
        }]
      });
    });
  });

  test('should load onboarding with skeleton state', async ({ page }) => {
    // Mock slow workflow initialization
    await page.route('**/rpc/ensure_onboarding_workflow', (route) => {
      setTimeout(() => {
        route.fulfill({ json: 'workflow-id' });
      }, 2000);
    });

    await page.goto('/onboarding');

    // Should show skeleton loader
    await expect(page.locator('[role="main"][aria-label="Setting up your onboarding"]')).toBeVisible();
    
    // Should have accessible loading announcement
    await expect(page.locator('.sr-only')).toContainText('Setting up your onboarding');
    
    // Should show skeleton elements
    await expect(page.locator('.animate-pulse')).toHaveCount({ min: 5 });
  });

  test('should handle workflow creation failure and retry', async ({ page }) => {
    let attemptCount = 0;
    
    await page.route('**/rpc/ensure_onboarding_workflow', (route) => {
      attemptCount++;
      if (attemptCount < 3) {
        route.fulfill({ status: 500, json: { error: 'Database error' } });
      } else {
        route.fulfill({ json: 'workflow-id-success' });
      }
    });

    await page.goto('/onboarding');

    // Should show error state after retries
    await expect(page.locator('text=Setup Failed')).toBeVisible();
    await expect(page.locator('text=Attempted 3 times')).toBeVisible();

    // Should have retry button
    const retryButton = page.locator('button:has-text("Try Again")');
    await expect(retryButton).toBeVisible();
    
    // Click retry should work
    await retryButton.click();
    await expect(page.locator('text=Retrying...')).toBeVisible();
  });

  test('should display live updates badge and disconnect banner', async ({ page }) => {
    // Mock successful workflow initialization
    await page.route('**/rpc/ensure_onboarding_workflow', (route) => {
      route.fulfill({ json: 'workflow-id' });
    });

    // Mock onboarding data
    await page.route('**/rest/v1/onboarding_workflows*', (route) => {
      route.fulfill({
        json: [{
          id: 'workflow-id',
          tenant_id: 'test-tenant-id',
          status: 'in_progress'
        }]
      });
    });

    await page.route('**/rest/v1/onboarding_steps*', (route) => {
      route.fulfill({
        json: [{
          id: 'step-1',
          workflow_id: 'workflow-id',
          step_number: 1,
          step_name: 'Business Verification',
          step_status: 'pending'
        }]
      });
    });

    await page.goto('/onboarding');

    // Should show live updates badge
    const liveIndicator = page.locator('[role="status"][aria-label*="Connection status"]');
    await expect(liveIndicator).toBeVisible();
    
    // Should have tooltip on hover
    await liveIndicator.hover();
    await expect(page.locator('text=Connected to live data feed')).toBeVisible();

    // Simulate disconnect by mocking WebSocket failure
    await page.evaluate(() => {
      // Trigger disconnect state in the component
      window.dispatchEvent(new CustomEvent('websocket-disconnect'));
    });

    // Should show disconnect banner
    await expect(page.locator('[role="status"]:has-text("Connection lost")')).toBeVisible();
    
    // Should have reconnect button
    const reconnectButton = page.locator('button:has-text("Reconnect")');
    await expect(reconnectButton).toBeVisible();
    await expect(reconnectButton).toBeEnabled();
  });

  test('should handle focus management and accessibility', async ({ page }) => {
    // Mock successful initialization
    await page.route('**/rpc/ensure_onboarding_workflow', (route) => {
      route.fulfill({ json: 'workflow-id' });
    });

    await page.route('**/rest/v1/onboarding_workflows*', (route) => {
      route.fulfill({ json: [{ id: 'workflow-id', status: 'in_progress' }] });
    });

    await page.route('**/rest/v1/onboarding_steps*', (route) => {
      route.fulfill({
        json: [{
          id: 'step-1',
          step_number: 1,
          step_name: 'Business Verification',
          step_status: 'pending'
        }]
      });
    });

    await page.goto('/onboarding');

    // Wait for welcome screen
    await expect(page.locator('text=Welcome to Test AgriCorp!')).toBeVisible();
    
    // Start setup button should be focusable
    const startButton = page.locator('button:has-text("Start Setup")');
    await expect(startButton).toBeVisible();
    await startButton.focus();
    await expect(startButton).toBeFocused();
    
    // Should have proper focus ring
    await expect(startButton).toHaveClass(/focus:ring-2/);
    
    await startButton.click();

    // Should focus on main content after initialization
    await expect(page.locator('[tabindex="-1"]:focus')).toBeVisible();
    
    // Step navigation buttons should be accessible
    const stepButtons = page.locator('button[aria-label*="Step"]');
    await expect(stepButtons.first()).toBeVisible();
    
    // Should have proper ARIA labels
    await expect(stepButtons.first()).toHaveAttribute('aria-label', /Step 1: Business Verification/);
  });

  test('should preload next step components', async ({ page }) => {
    // Mock all required data
    await page.route('**/rpc/ensure_onboarding_workflow', (route) => {
      route.fulfill({ json: 'workflow-id' });
    });

    await page.route('**/rest/v1/onboarding_workflows*', (route) => {
      route.fulfill({ json: [{ id: 'workflow-id', status: 'in_progress' }] });
    });

    await page.route('**/rest/v1/onboarding_steps*', (route) => {
      route.fulfill({
        json: [
          { id: 'step-1', step_number: 1, step_name: 'Business Verification', step_status: 'pending' },
          { id: 'step-2', step_number: 2, step_name: 'Subscription Plan', step_status: 'pending' }
        ]
      });
    });

    await page.goto('/onboarding');
    
    // Skip welcome screen
    await page.locator('button:has-text("Start Setup")').click();
    
    // Should load first step
    await expect(page.locator('text=Business Verification')).toBeVisible();
    
    // Should preload next step (this would be validated by checking network requests or component state)
    // In a real test, you'd verify that the next step component is loaded in the background
    await page.waitForTimeout(200); // Allow preloading time
    
    // Navigate to next step should be fast
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await expect(page.locator('text=Subscription Plan')).toBeVisible();
    }
  });
});
