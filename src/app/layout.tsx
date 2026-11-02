import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MoodSync — 情绪共鸣日记",
  description: "写下心情，AI 为你找到最贴合的 BGM",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
