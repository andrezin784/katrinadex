'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAccount, useConfig } from 'wagmi';
import { createDID, getStoredDID, storeDIDLocally, DIDCredential } from '@/lib/did';
import { toast } from 'sonner';

interface VerifiedModeToggleProps {
  required: boolean;
  onVerified: (verified: boolean) => void;
  threshold: string;
}

export function VerifiedModeToggle({
  required,
  onVerified,
  threshold,
}: VerifiedModeToggleProps) {
  const config = useConfig();
  const { address, chain } = useAccount();
  const [isVerifying, setIsVerifying] = useState(false);
  const [credential, setCredential] = useState<DIDCredential | null>(null);
  
  // Check for existing DID on mount
  useEffect(() => {
    const stored = getStoredDID();
    if (stored && address && stored.did.includes(address.toLowerCase())) {
      setCredential(stored);
      onVerified(true);
    }
  }, [address, onVerified]);
  
  const handleVerify = async () => {
    if (!address || !chain) return;
    
    setIsVerifying(true);
    
    try {
      const result = await createDID(config, chain.id, address);
      
      if (!result) {
        toast.error("Failed to create DID");
        return;
      }
      
      // Create credential object
      const newCredential: DIDCredential = {
        did: result.did,
        createdAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
        isActive: true,
        signature: result.signature,
      };
      
      // Store locally
      storeDIDLocally(newCredential);
      setCredential(newCredential);
      onVerified(true);
      
      toast.success("Identity Verified!", {
        description: `DID: ${result.did.slice(0, 30)}...`,
      });
    } catch (error: any) {
      console.error("DID verification failed:", error);
      toast.error(error?.message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };
  
  return (
    <AnimatePresence>
      {required && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className={`p-4 rounded-xl border ${
            credential 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-start gap-3">
              {credential ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
              )}
              
              <div className="flex-1">
                <h4 className={`font-medium ${credential ? 'text-green-300' : 'text-yellow-300'}`}>
                  {credential ? 'Identity Verified' : 'Verification Required'}
                </h4>
                
                <p className="text-xs text-gray-400 mt-1">
                  {credential 
                    ? `Verified as ${credential.did.slice(0, 40)}...`
                    : `Swaps above ${threshold} require identity verification for compliance.`
                  }
                </p>
                
                {!credential && (
                  <Button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="mt-3 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                    size="sm"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Verify Identity
                      </>
                    )}
                  </Button>
                )}
                
                {credential && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      Expires: {new Date(credential.expiresAt * 1000).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

