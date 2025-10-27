import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-poppins",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Detectify - AI Deepfake Detection Platform",
  description:
    "Advanced AI-powered deepfake detection for images and videos. Protect against scams, impersonation, and misinformation.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <body className="font-sans bg-black text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
