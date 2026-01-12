import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "TigerGraph DevHub",
  description: "AI-powered developer portal for TigerGraph - Learn, Build, and Master Graph Databases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans bg-dark-900 text-dark-100 min-h-screen">
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />
          
          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <Header />
            
            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
