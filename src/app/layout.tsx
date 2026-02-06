import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Global News Dashboard",
  description: "화제성 높은 전 세계 뉴스 대시보드 & 아카이빙",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
