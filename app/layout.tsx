import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "No Bullshit Downloader - YouTube to MP4 Converter",
  description:
    "A simple, fast, and reliable YouTube video downloader. Convert YouTube videos to MP4 format with custom quality selection.",
  keywords: [
    "YouTube downloader",
    "MP4 converter",
    "video download",
    "yt-dlp",
    "video converter",
  ],
  authors: [{ name: "No Bullshit Downloader" }],
  creator: "No Bullshit Downloader",
  publisher: "No Bullshit Downloader",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://nbsd.vercel.app"),
  openGraph: {
    title: "No Bullshit Downloader - YouTube to MP4 Converter",
    description:
      "A simple, fast, and reliable YouTube video downloader. Convert YouTube videos to MP4 format with custom quality selection.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "No Bullshit Downloader - YouTube to MP4 Converter",
    description:
      "A simple, fast, and reliable YouTube video downloader. Convert YouTube videos to MP4 format with custom quality selection.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background`}
      >
        <div className="relative flex min-h-screen flex-col">
          <main className="flex-1">{children}</main>
        </div>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
