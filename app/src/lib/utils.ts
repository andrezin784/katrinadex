import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitiza strings para prevenir XSS
 * Remove caracteres perigosos e tags HTML
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Remove tags HTML
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove caracteres perigosos
  sanitized = sanitized
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
  
  // Limita tamanho
  return sanitized.slice(0, 1000);
}

/**
 * Valida endereço Ethereum
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Valida e sanitiza endereço Ethereum
 */
export function sanitizeAddress(address: string): string | null {
  const sanitized = sanitizeInput(address.trim());
  return isValidAddress(sanitized) ? sanitized : null;
}

/**
 * Escape HTML para prevenir XSS ao renderizar conteúdo dinâmico
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}






