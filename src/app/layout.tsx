import type { Metadata } from "next";
import { Birthstone, Cormorant_Garamond, Inter } from "next/font/google";
import { PageViewTracker } from "@/components/shared/PageViewTracker";
import "./globals.css";

const birthstone = Birthstone({
  variable: "--font-birthstone",
  subsets: ["latin"],
  weight: "400",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://thais-monteiro-media-kit.vercel.app"
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Thais Monteiro | Mídia Kit",
  description:
    "Mídia kit digital de Thais Monteiro: lifestyle, maternidade, moda e rotina real.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg?v=2",
  },
  openGraph: {
    title: "Thais Monteiro | Mídia Kit",
    description:
      "Lifestyle, maternidade, moda e rotina real com autenticidade.",
    url: siteUrl,
    siteName: "Thais Monteiro Mídia Kit",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${birthstone.variable} ${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageViewTracker />
        {children}
      </body>
    </html>
  );
}
