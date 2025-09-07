import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SimpleAuthProvider } from "@/components/auth/SimpleAuthProvider"
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "拾光集 - 个人生活记录",
  description: "记录生活中的美好瞬间，珍藏个人时光",
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
          <SimpleAuthProvider>
            {children}
          </SimpleAuthProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
