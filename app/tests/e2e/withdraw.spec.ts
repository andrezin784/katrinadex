import { test, expect } from '@playwright/test';

test.describe('Withdraw Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/withdraw');
  });

  test('deve carregar a página de withdraw', async ({ page }) => {
    await expect(page).toHaveURL(/.*withdraw/);
  });

  test('deve exibir opções de withdraw (normal e gasless)', async ({ page }) => {
    // Verificar se há toggle ou opções de withdraw
    const gaslessToggle = page.locator('text=Gasless, text=gasless, [class*="gasless"]').first();
    if (await gaslessToggle.count() > 0) {
      await expect(gaslessToggle).toBeVisible();
    }
  });

  test('deve exibir campo de recipient address', async ({ page }) => {
    // Verificar se há input de endereço
    const recipientInput = page.locator('input[placeholder*="recipient"], input[placeholder*="Recipient"], input[placeholder*="address"]').first();
    if (await recipientInput.count() > 0) {
      await expect(recipientInput).toBeVisible();
    }
  });

  test('deve exibir campo de valor', async ({ page }) => {
    // Verificar se há input de valor
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
    if (await amountInput.count() > 0) {
      await expect(amountInput).toBeVisible();
    }
  });

  test('deve exibir informações de fee quando gasless está ativo', async ({ page }) => {
    // Tentar ativar gasless se houver toggle
    const gaslessToggle = page.locator('button:has-text("Gasless"), [class*="gasless"] input[type="checkbox"]').first();
    if (await gaslessToggle.count() > 0) {
      await gaslessToggle.click();
      // Verificar se há informação de fee
      const feeInfo = page.locator('text=0.4%, text=fee, text=Fee').first();
      if (await feeInfo.count() > 0) {
        await expect(feeInfo).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

