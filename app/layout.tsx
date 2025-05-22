import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
    icon: '/TPM_logo_designs/TPM Wordmark (Dark - No Map).png',
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
