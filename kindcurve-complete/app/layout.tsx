import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Kind Curve — Giving, shaped by you",
  description:
    "Build your personalised charitable giving portfolio in seconds. Choose causes, set your monthly commitment, and watch your impact compound over time. No platform fees.",
  metadataBase: new URL("https://kindcurve.co.uk"),
  openGraph: {
    title: "Kind Curve — Build Your Giving Portfolio",
    description:
      "Create a personalised charitable portfolio that compounds your impact over time. Guided by kindness, backed by data.",
    url: "https://kindcurve.co.uk",
    siteName: "Kind Curve",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kind Curve — Build Your Giving Portfolio. Start Your Kind Curve.",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kind Curve — Build Your Giving Portfolio",
    description:
      "Create a personalised charitable portfolio that compounds your impact over time.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  themeColor: "#267D91",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
