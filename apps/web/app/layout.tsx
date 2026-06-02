import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "CTX - Portable Memory for AI Workflows",
  description: "Capture, organize, monitor, search, version, and inject reusable AI context.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#FAFAF8"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-mint focus:px-4 focus:py-2 focus:text-foreground"
        >
          Skip to main content
        </a>
        <div className="flex min-h-screen">
          <AppSidebar />
          <div className="min-w-0 flex-1">
            <Navbar />
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
