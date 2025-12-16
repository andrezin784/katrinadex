import { test, expect, devices } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('deve funcionar em mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/');
    
    // Verificar se elementos principais estão visíveis
    await expect(page.locator('body')).toBeVisible();
    
    // Verificar se não há overflow horizontal
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = page.viewportSize()?.width || 375;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 10); // Margem de erro
  });

  test('deve funcionar em tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });

  test('deve funcionar em desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 }); // Desktop
    await page.goto('/');
    
    await expect(page.locator('body')).toBeVisible();
  });
});

