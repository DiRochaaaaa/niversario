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
  title: "Aniversário de Kart",
  description: "Confirme sua presença no meu aniversário de kart!",
  icons: {
    icon: [
      { url: '/kart-icon.svg', type: 'image/svg+xml' },
      { url: '/kart-icon-alt.svg', type: 'image/svg+xml', sizes: 'any' }
    ],
    apple: [
      { url: '/kart-icon.svg', type: 'image/svg+xml' }
    ],
    shortcut: [
      { url: '/kart-icon.svg', type: 'image/svg+xml' }
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/kart-icon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/kart-icon-alt.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}
      >
        {children}
      </body>
    </html>
  );
}
