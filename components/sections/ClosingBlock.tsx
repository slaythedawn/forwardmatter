import Link from "next/link";
import { ArrowIcon } from "../ArrowIcon";
import { ContactForm } from "../ContactForm";
import { closing, people } from "@/content/site";

export function ClosingBlock() {
  return (
    <section id="contact" className="section--ruled">
      <div className="closing">
        <div className="closing__col">
          <div className="eyebrow">{closing.eyebrow}</div>
          <h2 className="h2 h2--mid" style={{ margin: "20px 0 0" }}>
            {closing.title}
          </h2>
          <p className="closing__lead">{closing.body}</p>

          <div className="well team-strip">
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
              <Link href="/about#people" className="team-strip__link">
                {closing.teamLink}
                <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}
