'use client';

import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, Info, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const STORAGE_KEY = 'katrina:privacySeen';
const FEATURE_FLAG = process.env.NEXT_PUBLIC_ENABLE_ONBOARDING !== 'false';

export function PrivacyOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if onboarding is enabled and user hasn't seen it
    if (!FEATURE_FLAG) return;

    const hasSeen = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true';
    if (!hasSeen) {
      // Small delay to ensure page is loaded
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  const handleUnderstood = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setOpen(false);
  };

  if (!FEATURE_FLAG) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-cyan-500/20">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <span>Entenda sua <span className="text-gradient-static">Privacidade</span></span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base text-slate-400">
            Antes de usar o KatrinaDEX, é importante entender o que é privado e o que é público.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          {/* O que é privado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-green-500/20 bg-green-500/5 hover:border-green-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <CardTitle className="text-white text-lg">O que é privado</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Seu endereço de origem</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Valor dentro do pool</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Seu endereço de destino</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Conexão entre depósito e saque</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* O que é público */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-yellow-500/20 bg-yellow-500/5 hover:border-yellow-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <CardTitle className="text-white text-lg">O que é público</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    <code className="text-xs bg-black/40 px-1.5 py-0.5 rounded">nullifierHash</code> no blockchain
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Pool escolhido (0.1 ETH, 1 ETH, etc.)</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Timestamp da transação</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">Valor total do pool (TVL)</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Como funciona */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-cyan-500/20 bg-cyan-500/5 hover:border-cyan-500/40 transition-colors">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-cyan-400" />
                  <CardTitle className="text-white text-lg">Como funciona</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    Provas ZK geradas no seu browser — nunca saem do dispositivo
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    Verificação TRM antes de cada saque (compliance)
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    Sem KYC, sem rastreamento, sem coleta de dados
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 flex-shrink-0" />
                  <p className="text-sm text-slate-300">
                    Anonimato garantido por matemática, não por confiança
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <AlertDialogAction
            onClick={handleUnderstood}
            className="w-full h-12 text-lg font-bold bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white"
          >
            Entendi, continuar
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

