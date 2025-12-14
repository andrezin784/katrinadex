'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Zap, AlertCircle } from 'lucide-react';

interface PrivateSwapToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isGenerating?: boolean;
  proofTime?: number;
}

export function PrivateSwapToggle({
  enabled,
  onToggle,
  isGenerating = false,
  proofTime,
}: PrivateSwapToggleProps) {
  return (
    <div className={`p-4 rounded-xl border transition-all duration-300 ${
      enabled 
        ? 'bg-purple-500/10 border-purple-500/30' 
        : 'bg-white/5 border-white/10 hover:border-white/20'
    }`}>
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            disabled={isGenerating}
            className="sr-only"
          />
          <div className={`w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-purple-500' : 'bg-gray-600'
          }`}>
            <motion.div
              className="w-5 h-5 bg-white rounded-full shadow-md"
              animate={{ x: enabled ? 26 : 2 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              style={{ marginTop: 2 }}
            />
          </div>
        </div>
        
        <div className="ml-4 flex-1">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${enabled ? 'text-purple-400' : 'text-gray-400'}`} />
            <span className={`font-medium ${enabled ? 'text-purple-300' : 'text-white'}`}>
              Private Swap
            </span>
            {enabled && (
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                ZK-SNARK
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-400 mt-1">
            {enabled 
              ? 'Amount and addresses are hidden using zero-knowledge proofs'
              : 'Enable to hide swap details with ZK proofs'
            }
          </p>
          
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300">Amount hidden</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Lock className="w-3 h-3 text-purple-400" />
                <span className="text-gray-300">Addresses hidden</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Zap className="w-3 h-3 text-yellow-400" />
                <span className="text-gray-300">
                  Proof generation: {proofTime ? `${proofTime}s` : '<3s'}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </label>
      
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-black/40 rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-purple-300">Generating ZK Proof...</span>
          </div>
          <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 3, ease: 'linear' }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

