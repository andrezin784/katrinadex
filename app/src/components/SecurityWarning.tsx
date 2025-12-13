'use client';

import { useState } from 'react';
import { AlertTriangle, X, Shield, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function SecurityWarning() {
  const [dismissed, setDismissed] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-6"
      >
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 border border-yellow-500/50 rounded-lg p-4 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-300 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Aviso de Segurança - Proteção contra Phishing
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                <strong className="text-yellow-200">Sempre verifique o domínio:</strong> Certifique-se de que está acessando{' '}
                <code className="bg-black/30 px-2 py-1 rounded text-yellow-200">katrinadex.xyz</code> ou{' '}
                <code className="bg-black/30 px-2 py-1 rounded text-yellow-200">katrinadex.eth</code>
              </p>
              
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 space-y-2 text-xs text-gray-400"
                >
                  <div className="bg-black/20 rounded p-3 space-y-2">
                    <p><strong className="text-yellow-300">⚠️ Sinais de Phishing:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Domínios similares (ex: katrinadex-xyz.com, katrinadex.xyz.fake)</li>
                      <li>Pedidos de seed phrase ou chave privada</li>
                      <li>Links suspeitos em emails ou mensagens</li>
                      <li>Interfaces que pedem permissões excessivas</li>
                    </ul>
                    <p className="mt-2"><strong className="text-yellow-300">✅ Boas Práticas:</strong></p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Salve o link oficial nos seus favoritos</li>
                      <li>Nunca compartilhe sua private note</li>
                      <li>Verifique sempre o endereço do contrato antes de depositar</li>
                      <li>Use apenas carteiras oficiais (MetaMask, RainbowKit, etc.)</li>
                    </ul>
                  </div>
                </motion.div>
              )}

              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs h-7 border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                >
                  {showDetails ? 'Ocultar' : 'Ver Mais'} Detalhes
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDismissed(true)}
                  className="text-xs h-7 text-gray-400 hover:text-gray-300"
                >
                  <X className="w-3 h-3 mr-1" />
                  Dispensar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

