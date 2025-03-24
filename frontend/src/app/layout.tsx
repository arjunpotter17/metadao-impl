import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { SolanaWalletProvider } from "@/components/WalletProvider";
import { WalletButton } from "@/components/WalletButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MetaDAO - DAO Management Platform",
  description: "A platform for managing Decentralized Autonomous Organizations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <SolanaWalletProvider>
          <nav className="bg-white shadow-sm">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold text-gray-800">
                MetaDAO
              </Link>
              <WalletButton />
            </div>
          </nav>
          {children}
        </SolanaWalletProvider>
      </body>
    </html>
  );
}
