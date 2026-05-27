import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "五音阁 - 国风旋律创作平台",
  description: "面向零基础用户的国风五声音阶简易电子旋律创作平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}
