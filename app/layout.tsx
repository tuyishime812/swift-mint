import type { Metadata } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { CookieBanner } from "@/components/CookieBanner";
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
        <SiteHeader />
        <div id="main-content">
          {children}
        </div>
        <SiteFooter />
        <CookieBanner />
      </body>
    </html>
  );
}
