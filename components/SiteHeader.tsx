import Link from "next/link";
import { ArrowIcon } from "./ArrowIcon";
import { BrandMark } from "./BrandMark";
import { siteMeta } from "@/content/site";

/**
 * `page` decides which nav item is marked current and whether the section links
 * resolve within the current document or back to the home page.
 */
export function SiteHeader({ page }: { page: "home" | "about" }) {
  const onHome = page === "home";
  const href = (hash: string) => (onHome ? hash : `/${hash}`);

  return (
    <header className="site-header">
      <Link href="/" className="logo-lockup" aria-label={`${siteMeta.name} home`}>
        <span className="logo-tile">
          <BrandMark style={{ display: "block", width: "100%", height: "100%" }} />
        </span>
        <span className="wordmark">{siteMeta.name}</span>
      </Link>
      <nav className="site-nav" aria-label="Primary">
        <Link href={href("#technology")} className="site-nav__link">
          Technology
        </Link>
        <Link href={href("#platform")} className="site-nav__link">
          Platform
        </Link>
        <Link
          href="/about"
          className={`site-nav__link${page === "about" ? " site-nav__link--current" : ""}`}
          aria-current={page === "about" ? "page" : undefined}
        >
          About us
        </Link>
        <Link href={href("#contact")} className="btn btn--primary btn--compact">
          Contact
        </Link>
      </nav>
    </header>
  );
}
