import type { Metadata } from "next";
import "./globals.css";
import { Barlow } from 'next/font/google';

const barlow = Barlow({
  subsets: ['latin'],
  weight: ['700'], // Use 700 for bold text
});


export const metadata: Metadata = {
  title: "Tawny Park Metrics",
  description: "Tawny Park Metrics",
  icons: {
    icon: [
      { url: '/TPM_logo_designs/TPM Circle.png', sizes: '16x16', type: 'image/png' },
      { url: '/TPM_logo_designs/TPM Circle.png', sizes: '32x32', type: 'image/png' },
      { url: '/TPM_logo_designs/TPM Circle.png', sizes: '192x192', type: 'image/png' },
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
      <body
        className={`${barlow.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
