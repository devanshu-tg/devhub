import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import Shell from "@/components/layout/Shell";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { Toaster } from "react-hot-toast";

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TigerGraph DevHub",
  description: "AI-powered developer portal for TigerGraph — Learn, Build, and Master Graph Databases",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-bg text-fg min-h-screen">
        <ThemeProvider>
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "var(--toast-bg)",
                  color: "var(--toast-text)",
                  border: "1px solid var(--toast-border)",
                },
                success: {
                  iconTheme: { primary: "var(--tg-orange)", secondary: "white" },
                },
                error: {
                  iconTheme: { primary: "#ef4444", secondary: "white" },
                },
              }}
            />
            <div className="min-h-screen flex flex-col">
              <Shell />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
