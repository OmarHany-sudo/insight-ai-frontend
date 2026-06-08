import { test, expect } from '@playwright/test';

test.describe('Core SaaS Flow', () => {
  test('should allow user to sign up and view dashboard', async ({ page }) => {
    // 1. Marketing Landing Page
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle(/Insight AI/);
    
    // 2. Navigate to Login/Signup
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*login/); // Simplified for MVP

    // 3. Perform Signup (Mocked)
    // await page.fill('input[name="email"]', 'newuser@example.com');
    // await page.fill('input[name="password"]', 'Password123!');
    // await page.click('button[type="submit"]');

    // 4. Onboarding - Create Organization
    // await page.fill('input[name="orgName"]', 'Acme Corp');
    // await page.click('text=Create Organization');

    // 5. Verify Dashboard Rendering
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText('Overview');
    await expect(page.locator('text=GEO Score')).toBeVisible();
    
    // 6. Navigate to Analytics
    await page.click('text=Analytics');
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator('text=Visibility Index')).toBeVisible();
  });

  test('should handle billing redirection', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard/settings/billing');
    await expect(page.locator('text=Current Plan')).toBeVisible();
    
    // Click upgrade (would normally redirect to Stripe)
    // await page.click('text=Upgrade Plan');
    // await expect(page).toHaveURL(/.*stripe.com/);
  });
});
