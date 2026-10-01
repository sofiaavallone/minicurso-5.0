import "../styles/globals.css";
import { mono, sans, serif } from "../styles/fonts";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-capsule-bg">{children}</body>
    </html>
  );
}
