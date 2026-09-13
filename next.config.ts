import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a flat, host-anywhere export in `out/` for sharing a
 * preview. It drops the /api/contact route (see scripts/build-static.mjs) and the
 * image optimiser, so the real deployment should always use the default build.
 */
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  ...(staticExport
    ? {
        output: "export" as const,
        trailingSlash: false,
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
