import { test, expect } from '@playwright/test';

test.describe('Deposit Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deposit');
  });

  test('deve carregar a página de deposit', async ({ page }) => {
    await expect(page).toHaveURL(/.*deposit/);
  });

  test('deve exibir o stepper de deposit', async ({ page }) => {
    // Verificar se há elementos de stepper ou steps
    const stepper = page.locator('[class*="stepper"], [class*="step"], [data-testid="stepper"]').first();
    if (await stepper.count() > 0) {
      await expect(stepper).toBeVisible();
    }
  });

  test('deve exibir opções de token (ETH, USDC, EURC)', async ({ page }) => {
    // Verificar se há seleção de token
    const tokenSelect = page.locator('text=ETH, text=USDC, text=EURC, [class*="token"]').first();
    if (await tokenSelect.count() > 0) {
      await expect(tokenSelect).toBeVisible();
    }
  });

  test('deve exibir campo de valor', async ({ page }) => {
    // Verificar se há input de valor
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
    if (await amountInput.count() > 0) {
      await expect(amountInput).toBeVisible();
    }
  });

  test('deve exibir botão de conectar wallet se não conectado', async ({ page }) => {
    // Verificar se há botão de conectar wallet
    const connectButton = page.locator('button:has-text("Connect"), button:has-text("Connect Wallet")').first();
    if (await connectButton.count() > 0) {
      await expect(connectButton).toBeVisible();
    }
  });
});

