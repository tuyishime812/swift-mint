import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountNotice } from "@/components/AccountNotice";
import { CookieBanner } from "@/components/CookieBanner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SwiftMint Exchange",
    template: "%s | SwiftMint Exchange",
  },
  description:
    "Premium outbound mobile money facilitation from Malawi to selected African countries. Send mobile wallet payouts to Kenya, Tanzania, Uganda, Zambia, and Ghana.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "SwiftMint Exchange",
    description:
      "Premium outbound mobile money facilitation from Malawi to selected African countries.",
    url: "https://swiftmint.exchange",
    siteName: "SwiftMint Exchange",
    locale: "en_MW",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ThemeProvider>
          <AuthProvider>
            <SiteHeader />
            <div id="main-content" className="layout-main">
              {children}
            </div>
            <SiteFooter />
            <AccountNotice />
            <CookieBanner />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
