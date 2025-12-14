'use client';

import { motion } from "framer-motion";

export default function Mascot({ className }: { className?: string }) {
  return (
    <div className={className}>
      <motion.svg
        viewBox="0 0 400 400"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
        initial={{ y: 0 }}
        animate={{ y: -20 }}
        transition={{
          repeat: Infinity,
          repeatType: "reverse",
          duration: 3,
          ease: "easeInOut"
        }}
      >
        <defs>
          <linearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="glassesGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hair - Cyberpunk Style */}
        <motion.path
          d="M100 150 C 80 100, 150 50, 200 50 C 250 50, 320 100, 300 150 C 320 200, 300 350, 250 380 L 150 380 C 100 350, 80 200, 100 150 Z"
          fill="url(#hairGradient)"
          initial={{ scale: 0.98 }}
          animate={{ scale: 1.02 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        />

        {/* Face Shape */}
        <path
          d="M130 150 L 130 250 Q 200 320 270 250 L 270 150 Z"
          fill="#1a1a1a"
          stroke="#3B82F6"
          strokeWidth="2"
        />

        {/* Cyberpunk Glasses */}
        <g transform="translate(0, 10)">
          <path
            d="M120 170 L 280 170 L 270 210 L 130 210 Z"
            fill="rgba(0,0,0,0.8)"
            stroke="url(#glassesGradient)"
            strokeWidth="3"
            filter="url(#glow)"
          />
          {/* Digital Code Reflection in Glasses */}
          <motion.text
            x="140"
            y="195"
            fontSize="10"
            fill="#00F5FF"
            fontFamily="monospace"
            initial={{ x: 140 }}
            animate={{ x: 240 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            clipPath="polygon(120 170, 280 170, 270 210, 130 210)"
          >
            01010101
          </motion.text>
        </g>

        {/* Jacket Collar */}
        <path
          d="M100 300 L 80 400 L 320 400 L 300 300 Z"
          fill="#0a0a0a"
          stroke="#8B5CF6"
          strokeWidth="2"
        />

        {/* Earphones/Tech */}
        <circle cx="120" cy="200" r="10" fill="#00F5FF" filter="url(#glow)" />
        <circle cx="280" cy="200" r="10" fill="#00F5FF" filter="url(#glow)" />

      </motion.svg>
    </div>
  );
}








