import type { Metadata } from "next";
import { DM_Serif_Display, Figtree, JetBrains_Mono } from "next/font/google";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Cápsula do tempo",
  description: "Escreva cartas para o seu eu do futuro e abra cada uma na data marcada.",
};

const display = DM_Serif_Display({ subsets: ["latin"], weight: "400", variable: "--font-display" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-[#fdeaf3] font-sans text-neutral-950 antialiased">{children}</body>
    </html>
  );
}
