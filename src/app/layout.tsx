import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./custom.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "TechToCheck — Technology worth your attention",
    template: "%s | TechToCheck",
  },
  description:
    "Honest technology product reviews, comparisons, and buying guides. We test. We compare. You decide.",
  creator: "3rudit3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="w-full">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
