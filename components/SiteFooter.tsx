import { SiteLink } from "./SiteLink";
import { BrandMark } from "./BrandMark";
import { Wordmark } from "./Wordmark";
import { href as route } from "@/lib/href";
import { siteMeta } from "@/content/site";

export function SiteFooter({ page }: { page: "home" | "about" | "simulator" }) {
  const onHome = page === "home";
  const href = (hash: string) => route(onHome ? hash : `/${hash}`);

  return (
    <footer className="site-footer">
      <SiteLink href={route("/")} className="site-footer__brand">
        <BrandMark cut="small" className="footer-mark" />
        <Wordmark />
      </SiteLink>
      <div className="site-footer__nav">
        <SiteLink href={href("#technology")}>Technology</SiteLink>
        <SiteLink href={href("#platform")}>Platform</SiteLink>
        <SiteLink href={route("/about")}>About us</SiteLink>
        <SiteLink href={href("#contact")}>Contact</SiteLink>
      </div>
      <div className="site-footer__legal">
        {siteMeta.legal[0]}
        <br />
        {siteMeta.legal[1]}
      </div>
    </footer>
  );
}
