import type { Metadata, Viewport } from "next";
import "./globals.css";

const STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

export const metadata: Metadata = {
  metadataBase: new URL("https://forwardmatter.com"),
  title: {
    default: "Forward Matter | Technology that predicts outcomes",
    template: "%s | Forward Matter",
  },
  description:
    "Forward Matter transforms complex market signals into systematic investment decisions. Trading and portfolio intelligence software for wealth advisers, asset managers and funds.",
  openGraph: {
    type: "website",
    siteName: "Forward Matter",
    locale: "en_AU",
    title: "Forward Matter | Technology that predicts outcomes",
    description:
      "Automated market intelligence. Trading and portfolio intelligence software for wealth advisers, asset managers and funds.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#eef0f3",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" crossOrigin="" />
        <link
          href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap"
          rel="stylesheet"
        />
        {STATIC_PREVIEW ? (
          <>
            {/*
              Preview hosts that block Fontshare would otherwise fall back to
              whatever sans the reviewer's device happens to have, which differs
              per machine. Inter is a near match and keeps the preview consistent.
              It is never loaded by the real build.
            */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            <link
              href="https://fonts.googleapis.com/css2?family=Inter:wght@300..700&display=swap"
              rel="stylesheet"
            />
            <style>{`:root{--font-sans:"Switzer","Inter",ui-sans-serif,system-ui,-apple-system,sans-serif}`}</style>
          </>
        ) : null}
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
