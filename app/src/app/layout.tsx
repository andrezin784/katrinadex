import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ParticlesBackground from "@/components/ParticlesBackground";
import BottomNav from "@/components/BottomNav";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import '@rainbow-me/rainbowkit/styles.css';

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KatrinaDEX - Privacy Reimagined",
  description: "The most beautiful and compliant privacy mixer. ZK-proof technology + fixed pools + total compliance.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-[#0a0a0a] min-h-screen relative overflow-x-hidden selection:bg-[#00F5FF] selection:text-black`}>
        <Providers>
          <ParticlesBackground />
          
          {/* Main Layout Container */}
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>

          <BottomNav />
          <Toaster position="top-center" theme="dark" richColors />
        </Providers>
      </body>
    </html>
  );
}
