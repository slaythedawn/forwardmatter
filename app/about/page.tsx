import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/ArrowIcon";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { aboutPage, people } from "@/content/site";

export const metadata: Metadata = {
  title: "About us",
  description: aboutPage.body,
};

export default function AboutPage() {
  return (
    <div className="page">
      <div className="container">
        <SiteHeader page="about" />

        <main id="main">
          <section className="about-hero">
            <div className="eyebrow">{aboutPage.eyebrow}</div>
            <h1 className="h1 h1--about">
              {aboutPage.titleLead}
              <span className="accent">{aboutPage.titleAccent}</span>
            </h1>
            <p className="lead">{aboutPage.body}</p>
          </section>

          <section className="panel why">
            <div className="why__col">
              <div className="eyebrow why__eyebrow">{aboutPage.why.eyebrow}</div>
              <h2 className="h2 why__title">{aboutPage.why.title}</h2>
            </div>
            <div className="why__col why__copy">
              {aboutPage.why.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section id="people" className="people">
            <div className="section-head">
              <div className="eyebrow section-head__eyebrow">{aboutPage.team.eyebrow}</div>
              <div className="section-head__body">
                <h2 className="h2">{aboutPage.team.title}</h2>
                <p className="body-17">{aboutPage.team.body}</p>
              </div>
            </div>

            <div className="people__grid">
              {people.map((person) => (
                <div className="card person" key={person.slug}>
                  <div className="person__head">
                    <span className="person__portrait">
                      <span
                        className="avatar"
                        role="img"
                        aria-label={person.name}
                        style={{ backgroundImage: `url(${person.photo})` }}
                      />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <h3 className="person__name">{person.name}</h3>
                      <div className="person__role">{person.role}</div>
                    </div>
                  </div>
                  <div className="person__divider" />
                  <div className="eyebrow eyebrow--sm">Owns</div>
                  <p className="person__owns">{person.owns}</p>
                  <p className="person__body">{person.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="contact" className="about-cta">
            <div className="about-cta__col">
              <h2 className="h2 about-cta__title">{aboutPage.cta.title}</h2>
              <p className="about-cta__body">{aboutPage.cta.body}</p>
            </div>
            <Link href="/#contact" className="btn btn--primary">
              {aboutPage.cta.label}
              <ArrowIcon className="btn__icon" />
            </Link>
          </section>
        </main>

        <SiteFooter page="about" />
      </div>
    </div>
  );
}
