import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. Оновлюємо метадані для красивої вкладки в браузері
export const metadata: Metadata = {
  title: "QUANT_CORE | Trading Dashboard",
  description: "Automated trading system execution and monitoring environment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en" // Залишаємо "en", оскільки інтерфейс у нас англійською
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      {/* 2. Додаємо базовий темний фон bg-[#050505] сюди, щоб не було білих спалахів при завантаженні */}
      <body className="min-h-full flex flex-col bg-[#050505] text-slate-200">
        {children}
        <Toaster theme="dark" position="bottom-right" richColors />
      </body>
    </html>
  );
}