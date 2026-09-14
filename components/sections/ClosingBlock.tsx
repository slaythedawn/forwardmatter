import { SiteLink } from "../SiteLink";
import { ArrowIcon } from "../ArrowIcon";
import { ContactForm } from "../ContactForm";
import { href as route } from "@/lib/href";
import { closing, people } from "@/content/site";

export function ClosingBlock() {
  return (
    <section id="contact" className="section--ruled">
      <div className="closing">
        <div className="closing__col">
          <div className="eyebrow">{closing.eyebrow}</div>
          <h2 className="h2 h2--mid closing__title">
            {closing.title}
          </h2>
          <p className="closing__lead">{closing.body}</p>

          <div className="team-strip">
            <div className="team-strip__row">
              <div className="team-strip__avatars">
                {people.map((person) => (
                  <span className="avatar-ring" key={person.slug}>
                    <span
                      className="avatar"
                      role="img"
                      aria-label={person.name}
                      style={{ backgroundImage: `url(${person.photo})` }}
                    />
                  </span>
                ))}
              </div>
              <SiteLink href={route("/about#people")} className="team-strip__link">
                {closing.teamLink}
                <ArrowIcon />
              </SiteLink>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
