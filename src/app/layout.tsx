import type { Metadata } from "next";
import { Bree_Serif } from "next/font/google";
import "./globals.css";

const breeSerif = Bree_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bree-serif",
});

export const metadata: Metadata = {
  title: "HUTEC - Evaluación de Demo",
  description: "Impulsa tu futuro interactivo",
  icons: {
    icon: "/_PORTAFOLIO-HUTEC.png",
    shortcut: "/_PORTAFOLIO-HUTEC.png",
    apple: "/_PORTAFOLIO-HUTEC.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${breeSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <header className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <img src="/_PORTAFOLIO-HUTEC.png" alt="HUTEC Logo" className="h-12" />
        </header>
        {children}
      </body>
    </html>
  );
}
