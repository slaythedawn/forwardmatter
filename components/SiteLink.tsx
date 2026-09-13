import Link from "next/link";

const STATIC = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/**
 * A link that behaves correctly in both builds.
 *
 * The normal build uses next/link for client-side navigation. The static export
 * has no router to navigate with — its pages are flat .html files — so it renders
 * a plain anchor, which also stops the router prefetching routes that do not exist.
 */
export function SiteLink({
  href,
  children,
  ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (STATIC) {
    return (
      <a href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
