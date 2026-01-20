import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

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
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans bg-themed text-themed min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-text)',
                  border: '1px solid var(--toast-border)',
                },
                success: {
                  iconTheme: {
                    primary: '#f7941d',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: 'white',
                  },
                },
              }}
            />
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar />
              
              {/* Main content area */}
              <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-hidden">
                {/* Header - needs overflow-visible for dropdown */}
                <div className="relative z-50">
                  <Header />
                </div>
                
                {/* Page content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                  {children}
                </main>
              </div>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
