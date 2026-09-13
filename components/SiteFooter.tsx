import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { siteMeta } from "@/content/site";

export function SiteFooter({ page }: { page: "home" | "about" }) {
  const onHome = page === "home";
  const href = (hash: string) => (onHome ? hash : `/${hash}`);

  return (
    <footer className="site-footer">
      <Link href="/" className="site-footer__brand">
        <BrandMark style={{ display: "block", width: 38, height: 32, flexShrink: 0 }} />
        <span>{siteMeta.name}</span>
      </Link>
      <div className="site-footer__nav">
        <Link href={href("#technology")}>Technology</Link>
        <Link href={href("#platform")}>Platform</Link>
        <Link href="/about">About us</Link>
        <Link href={href("#contact")}>Contact</Link>
      </div>
      <div className="site-footer__legal">
        {siteMeta.legal[0]}
        <br />
        {siteMeta.legal[1]}
      </div>
    </footer>
  );
}
