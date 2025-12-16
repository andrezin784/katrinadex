import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { PrivacyOnboarding } from "@/components/PrivacyOnboarding";
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KatrinaDEX - Privacy Reimagined | Arc Testnet",
  description: "The most advanced ZK privacy mixer. Total anonymity meets full regulatory compliance. Building in arc.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "KatrinaDEX - Privacy Reimagined",
    description: "The most advanced ZK privacy mixer built for the future.",
  },
  twitter: {
    card: "summary_large_image",
    title: "KatrinaDEX - Privacy Reimagined",
    description: "The most advanced ZK privacy mixer built for the future.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#030712] min-h-screen relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-white`}>
        <Providers>
          <ParticlesBackground />
          
          {/* Main Layout Container */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>

          <BottomNav />
          <PrivacyOnboarding />
          <Toaster 
            position="top-center" 
            theme="dark" 
            richColors 
            toastOptions={{
              style: {
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                backdropFilter: 'blur(12px)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
