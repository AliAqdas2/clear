import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clear - Financial Clarity",
  description: "Clear shows you the truth about your money today, and clarity about tomorrow.",
  manifest: "/manifest.json",
  themeColor: "#19e65e",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Clear",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className="bg-background-light text-text-main font-display antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
