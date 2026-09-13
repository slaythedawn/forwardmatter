import type { Metadata, Viewport } from "next";
import "./globals.css";

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
