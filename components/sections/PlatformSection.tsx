import { BrandMark } from "../BrandMark";
import { platform, platformSection, siteMeta } from "@/content/site";

export function PlatformSection() {
  return (
    <section id="platform" className="section--ruled">
      <div className="section-head section-head--offset">
        <div className="eyebrow section-head__eyebrow">{platformSection.eyebrow}</div>
        <div className="section-head__body">
          <h2 className="h2 h2--wide">{platformSection.title}</h2>
          <p className="body-17" style={{ maxWidth: "56ch" }}>
            {platformSection.body}
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="platform__strip">
          <div className="platform__strip-brand">
            <BrandMark style={{ display: "block", width: 36, height: 30, flexShrink: 0 }} />
            <span className="platform__strip-wordmark">{siteMeta.name}</span>
          </div>
          <span className="eyebrow eyebrow--sm">{siteMeta.tagline}</span>
        </div>

        <div className="platform__groups">
          {platform.map((group) => (
            <div className="platform__group" key={group.group}>
              <div className="platform__group-label">{group.group}</div>
              {group.items.map((item) => (
                <div className="platform__item" key={item.name}>
                  <h3 className="h3">{item.name}</h3>
                  <p className="body-15">{item.body}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
