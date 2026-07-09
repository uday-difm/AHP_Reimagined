import AuthProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import SessionTimeoutHandler from "@/components/utils/SessionTimeoutHandler";
import { Toaster } from "sonner";
import "@/core/listeners";

import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata = {
  title: "A Health Place — Building Wellness into Your Life",
  description: "A Health Place - Empathetic, medically accurate health guides covering physical wellness, mental health, insurance, and holistic lifestyle guidelines.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
     suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionTimeoutHandler timeoutMinutes={30} />
        {children}
        <CookieBanner />
                  <Toaster richColors position="top-right" closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
