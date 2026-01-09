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
  icons: {
    icon: [
      { url: "/icon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-32x32.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="shortcut icon" href="/icon-32x32.png" />
      </head>
      <body className="bg-background-light text-text-main font-display antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
