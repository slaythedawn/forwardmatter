import type { MetadataRoute } from "next";

export const dynamic = "force-static";

/* Android's equivalent of the Apple touch icon. iOS ignores the display mode
   here unless apple-mobile-web-app-capable is set, which it deliberately is not:
   a two-page marketing site is better off opening in Safari with its back
   button than as a chromeless standalone app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Forward Matter",
    short_name: "Forward Matter",
    description:
      "Automated market intelligence. Trading and portfolio intelligence software for wealth advisers, asset managers and funds.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef0f3",
    theme_color: "#eef0f3",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
