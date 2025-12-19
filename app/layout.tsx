import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tawny Park Metrics",
  description: "Tawny Park Metrics",
  icons: {
    icon: [
      { url: '/TPM_logo_designs/TPM Wordmark (Dark - No Map)', sizes: '16x16', type: 'image/png' },
      { url: '/TPM_logo_designs/TPM Wordmark (Dark - No Map)', sizes: '32x32', type: 'image/png' },
      { url: '/TPM_logo_designs/TPM Wordmark (Dark - No Map)', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/TPM_logo_designs/TPM Wordmark (Dark - No Map).png',
    apple: '/TPM_logo_designs/TPM Wordmark (Dark - No Map).png',
  },
  openGraph: {
    title: 'Tawny Park Metrics',
    description: 'NBA Analytics and Draft Analysis',
    images: ['/TPM_logo_designs/TPM Wordmark (Dark - No Map).png'],
  },
  twitter: {
    card: 'summary',
    title: 'Tawny Park Metrics',
    description: 'NBA Analytics and Draft Analysis',
    images: ['/TPM_logo_designs/TPM Wordmark (Dark - No Map).png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
      <GoogleAnalytics gaId="G-X22HKJ13B7" />
    </html>
  );
}
