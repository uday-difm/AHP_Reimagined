import { headers } from "next/headers";
import AuthProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import SessionTimeoutHandler from "@/components/utils/SessionTimeoutHandler";
import PageTransitionProvider from "@/components/providers/PageTransitionProvider";
import { Toaster } from "sonner";
import "@/core/listeners";

import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getLayoutData } from "@/services/layout.service";
import CookieBanner from "@/components/CookieBanner";
import { GlobalAnalytics } from "@yourcompany/global-backend-next/components";

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

function isDashboardPath(pathname) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/crm") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/maintenance") ||
    pathname.startsWith("/preview")
  );
}

export default async function RootLayout({ children }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const layout = await getLayoutData();

  if (isDashboardPath(pathname)) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <SessionTimeoutHandler timeoutMinutes={30} />
              {children}
              <Toaster richColors position="top-right" closeButton />
            </AuthProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  const complianceSettings = {
    cookieConsentEnabled: true,
    cookieText: "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.",
    cookieButtonText: "Accept All",
    cookieDeclineButtonText: "Reject All",
    ...(layout?.rawSettings?.compliance || {})
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
      suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionTimeoutHandler timeoutMinutes={30} />
            <GlobalAnalytics settings={layout?.rawSettings} />
            <PageTransitionProvider>
              {children}
            </PageTransitionProvider>
            <CookieBanner complianceSettings={complianceSettings} />
            <Toaster richColors position="top-right" closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
