import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LOF 监控',
  description: 'LOF 基金折溢价监控系统',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
