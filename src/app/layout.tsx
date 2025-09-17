import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleAuthProvider } from "@/components/auth/SimpleAuthProvider"
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { DecorationsProvider } from "@/components/decorations/DecorationsProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "拾光集 - 个人生活记录",
  description: "记录生活中的美好瞬间，珍藏个人时光",
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "拾光集",
    startupImage: [
      {
        media: "(device-width: 768px) and (device-height: 1024px)",
        url: "/icons/icon-512x512.png",
      },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "拾光集",
    title: "拾光集 - 个人生活记录",
    description: "记录生活中的美好瞬间，珍藏个人时光",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "拾光集应用图标",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "拾光集 - 个人生活记录",
    description: "记录生活中的美好瞬间，珍藏个人时光",
    images: {
      url: "/icons/icon-512x512.png",
      alt: "拾光集应用图标",
    },
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#6d49ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <ThemeProvider>
            <SimpleAuthProvider>
              <div className="app-gradient-bg min-h-screen relative">
                {/* 氛围装饰效果（统一管理，可在主题设置中开关与调节） */}
                <DecorationsProvider />
                {children}
              </div>
            </SimpleAuthProvider>
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
