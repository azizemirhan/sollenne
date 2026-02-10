import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sollenne Satın Alma Analizi",
  description: "Satın alma veri analizi ve görselleştirme dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
