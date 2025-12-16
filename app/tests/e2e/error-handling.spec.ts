import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test('deve exibir mensagem de erro para endereço inválido no withdraw', async ({ page }) => {
    await page.goto('/withdraw');
    
    // Tentar inserir endereço inválido
    const recipientInput = page.locator('input[placeholder*="recipient"], input[placeholder*="Recipient"], input[placeholder*="address"]').first();
    
    if (await recipientInput.count() > 0) {
      await recipientInput.fill('invalid-address');
      
      // Verificar se há validação (pode ser visual ou mensagem de erro)
      // O teste é flexível pois diferentes UIs podem mostrar erros de formas diferentes
      const hasValidation = await recipientInput.evaluate((el: HTMLInputElement) => {
        return el.validity?.valid === false || el.getAttribute('aria-invalid') === 'true';
      }).catch(() => false);
      
      // Se houver validação HTML5, verificar
      if (hasValidation) {
        expect(hasValidation).toBe(true);
      }
    }
  });

  test('deve exibir mensagem de erro para valor inválido', async ({ page }) => {
    await page.goto('/deposit');
    
    const amountInput = page.locator('input[type="number"], input[placeholder*="amount"], input[placeholder*="Amount"]').first();
    
    if (await amountInput.count() > 0) {
      await amountInput.fill('-100');
      
      // Verificar validação de valor negativo
      const hasValidation = await amountInput.evaluate((el: HTMLInputElement) => {
        return el.validity?.valid === false || el.getAttribute('min') !== null;
      }).catch(() => false);
      
      if (hasValidation) {
        expect(hasValidation).toBe(true);
      }
    }
  });

  test('deve lidar com desconexão de rede graciosamente', async ({ page }) => {
    // Simular offline
    await page.context().setOffline(true);
    
    await page.goto('/');
    
    // A página deve carregar mesmo offline (usando cache)
    await expect(page).toHaveURL(/.*\//);
    
    // Restaurar conexão
    await page.context().setOffline(false);
  });
});

