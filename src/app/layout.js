import AuthProvider from "@/components/providers/SessionProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import SessionTimeoutHandler from "@/components/utils/SessionTimeoutHandler";
import { Toaster } from "sonner";
import "@/core/listeners";
import { headers } from "next/headers";

import { Inter, Outfit, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getLayoutData } from "@/services/layout.service";
import ClientLayoutHelpers from "@/components/ClientLayoutHelpers";

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

export async function generateMetadata() {
  const layout = await getLayoutData();
  return {
    title: {
      default: layout.siteName || "A Health Place — Building Wellness into Your Life",
      template: layout.titleTemplate || `%s | ${layout.siteName || "A Health Place"}`,
    },
    description: layout.description || layout.tagline || "A Health Place - Empathetic, medically accurate health guides covering physical wellness, mental health, insurance, and holistic lifestyle guidelines.",
    icons: {
      icon: layout.faviconUrl || "/favicon.ico",
    },
    openGraph: {
      images: layout.ogImageUrl ? [{ url: layout.ogImageUrl }] : [],
    },
  };
}

export default async function RootLayout({ children }) {
  const layout = await getLayoutData();
  
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/crm") || pathname.startsWith("/preview");
  const basePath = isDashboard ? "/api/auth" : "/api/auth/frontend";

  const compliance = layout?.rawSettings?.compliance || {};
  const complianceSettings = {
    cookieConsentEnabled: compliance.cookieConsentEnabled !== false,
    cookieText: compliance.cookieConsentMessage || compliance.cookieText || "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.",
    cookieButtonText: compliance.acceptButtonText || compliance.cookieButtonText || "Accept All",
    cookieDeclineButtonText: compliance.declineButtonText || compliance.cookieDeclineButtonText || "Reject All",
    settingsButtonText: compliance.settingsButtonText || compliance.cookieSettingsButtonText || "Preferences",
    cookiePrivacyLink: compliance.cookiePrivacyLink || "/info?tab=legal&doc=privacy",
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${playfair.variable}`}
      suppressHydrationWarning>
      <head>
        {layout.adSettings?.autoAdsEnabled && layout.adSettings?.adsensePublisherId && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${layout.adSettings.adsensePublisherId}`}
            crossOrigin="anonymous"
          />
        )}

        {layout.globalJsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: layout.globalJsonLd }}
          />
        )}
        {layout.recaptchaSiteKey && (
          <meta name="recaptcha-site-key" content={layout.recaptchaSiteKey} />
        )}
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider basePath={basePath}>
            <SessionTimeoutHandler timeoutMinutes={30} />
            <ClientLayoutHelpers layout={layout} complianceSettings={complianceSettings}>
              {children}
            </ClientLayoutHelpers>
            <Toaster richColors position="top-right" closeButton />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
