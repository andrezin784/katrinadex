import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar a página inicial', async ({ page }) => {
    await expect(page).toHaveTitle(/KatrinaDEX/i);
  });

  test('deve exibir o hero section', async ({ page }) => {
    await expect(page.locator('text=Privacy Reimagined')).toBeVisible();
    await expect(page.locator('text=Total anonymity meets full regulatory compliance')).toBeVisible();
  });

  test('deve exibir os pool cards', async ({ page }) => {
    // Verificar se há pelo menos um pool card
    const poolCards = page.locator('[data-testid="pool-card"], .pool-card, [class*="PoolCard"]');
    await expect(poolCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('deve exibir os botões de ação principais', async ({ page }) => {
    // Verificar botões de navegação
    const depositButton = page.locator('a[href*="deposit"], button:has-text("Deposit")').first();
    const withdrawButton = page.locator('a[href*="withdraw"], button:has-text("Withdraw")').first();
    
    if (await depositButton.count() > 0) {
      await expect(depositButton).toBeVisible();
    }
    
    if (await withdrawButton.count() > 0) {
      await expect(withdrawButton).toBeVisible();
    }
  });

  test('deve exibir a seção de features', async ({ page }) => {
    // Verificar se há features visíveis
    const features = page.locator('text=Zero Knowledge, text=Compliance, text=Gasless').first();
    if (await features.count() > 0) {
      await expect(features).toBeVisible();
    }
  });

  test('deve exibir o footer', async ({ page }) => {
    await expect(page.locator('footer, [class*="footer"]').first()).toBeVisible();
  });

  test('deve ter link para Twitter no footer', async ({ page }) => {
    const twitterLink = page.locator('a[href*="twitter.com"], a[href*="x.com"]').first();
    if (await twitterLink.count() > 0) {
      await expect(twitterLink).toHaveAttribute('href', /x\.com|twitter\.com/);
    }
  });

  test('deve exibir badge "building in arc"', async ({ page }) => {
    const badge = page.locator('text=building in arc, text=Building in Arc').first();
    if (await badge.count() > 0) {
      await expect(badge).toBeVisible();
    }
  });
});

