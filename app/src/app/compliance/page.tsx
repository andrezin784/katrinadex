'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, ShieldCheck, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Compliance() {
  return (
    <div className="min-h-screen pt-24 px-6 max-w-4xl mx-auto text-center">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
        <ArrowLeft className="w-5 h-5" /> Back Home
      </Link>

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="w-32 h-32 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(34,197,94,0.3)]">
          <ShieldCheck className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-5xl font-bold text-white mb-6">100% Compliant</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          KatrinaDEX is the first privacy solution architected to meet strict global regulatory standards while preserving user privacy through Zero-Knowledge Proofs.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        {[
          { title: "FATF Travel Rule", desc: "Fully compliant with VASP requirements." },
          { title: "OFAC Sanctions", desc: "Real-time screening of illicit addresses." },
          { title: "Global Standards", desc: "Aligned with international banking guidelines." }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="glass p-8 rounded-3xl border border-white/10"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500 mb-4 mx-auto" />
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-gray-400 text-sm">{item.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button className="h-14 px-8 bg-white text-black hover:bg-gray-200 font-bold rounded-xl">
          <FileText className="w-5 h-5 mr-2" /> Read Whitepaper
        </Button>
        <Button variant="outline" className="h-14 px-8 border-white/10 text-white hover:bg-white/5 font-bold rounded-xl">
          <Globe className="w-5 h-5 mr-2" /> View Audit Report
        </Button>
      </div>
    </div>
  );
}

