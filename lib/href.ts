/**
 * Route helper.
 *
 * The site normally runs as a Next.js app with real routes. The static preview
 * build (`npm run build:static`) exports flat HTML files instead, which are served
 * from whatever path the host puts them on — so every link has to be relative.
 */
const STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const STATIC_ROUTES: Record<string, string> = {
  "/": "index.html",
  "/about": "about.html",
};

export function href(route: string): string {
  if (!STATIC) return route;
  if (route.startsWith("#")) return route;

  const hashAt = route.indexOf("#");
  const path = hashAt === -1 ? route : route.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : route.slice(hashAt);

  return (STATIC_ROUTES[path] ?? route) + hash;
}
