# Forward Matter

Marketing site for Forward Matter, a Sydney software company building automated
market-intelligence software for financial services and the pharmaceutical industry.

Built with Next.js (App Router) and plain CSS, from the design handoff kept in
`design-handoff/` (see `design-handoff/NOTES.md`).

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm start          # serve the production build
npm run typecheck  # tsc --noEmit
```

### Static preview build

```bash
npm run build:static   # flat, host-anywhere export in out/
```

`out/` can be dropped on any static host, including ones that serve from a
subdirectory. It exists so the site can be shared before a real deployment, and it
is not the thing to deploy: it has no `/api/contact` (the form shows its success
state without sending anything), no image optimiser, and it pins a Google Fonts
fallback for hosts that block Fontshare. Deploy `npm run build` instead.

## Layout

| Path | What it holds |
|---|---|
| `app/page.tsx` | Home — hero, intelligence system, catalyst panel, platform, case study, closing block |
| `app/about/page.tsx` | About us — why we exist, the team, contact CTA |
| `app/api/contact/route.ts` | Server-side validation and delivery for the enquiry form |
| `app/globals.css` | Design tokens and every shared surface, button and section style |
| `components/` | Shell (header, footer, brand mark) and one component per home section |
| `content/site.ts` | All copy and structured content |
| `public/` | Portraits, case-study photograph, the particle animation |

Copy changes belong in `content/site.ts`. Colour, shadow and spacing changes belong
in the token block at the top of `app/globals.css`.

## The visual language

A deliberate neumorphic treatment on a light grey ground: raised panels with a white
top-left highlight and a grey bottom-right drop shadow, recessed wells with inset
shadows, buttons that physically depress on `:active`, and `text-shadow: 0 1px #fff`
on most type. The shadow recipes are the heart of the style and live as CSS custom
properties (`--shadow-card`, `--shadow-well`, `--shadow-btn` and so on). The light
source is always top-left; keep that direction consistent when adding surfaces.

Every section is a `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` grid, so columns
collapse to one at narrow widths without media queries. Keep the `min(100%, …)`
inside `minmax` — a bare floor overflows the container instead of collapsing.

## Contact form

The form posts to `/api/contact`, which trims and validates the fields server-side
(name, firm and a well-formed email are required) and then forwards the enquiry.

Set `CONTACT_WEBHOOK_URL` to the CRM, inbox relay or Slack hook that should receive
enquiries. With no URL configured the route validates, logs and accepts, so the form
works in preview environments without wiring anything up.

## Accessibility and motion

- The particle brain is decorative: `aria-hidden`, never takes pointer events, and is
  not rendered at all when the visitor prefers reduced motion or canvas is
  unavailable, leaving the static radial highlight in place.
- A skip link, visible focus rings and `scroll-margin-top` on anchored sections (so
  targets clear the sticky header) are all in place.

## Known follow-ups

- **Switzer is loaded from Fontshare, not self-hosted.** The handoff asks for a
  self-hosted copy; the build environment cannot reach `api.fontshare.com`, so the
  stylesheet is linked with a `preconnect` as the prototype does. Drop the woff2
  files into `public/fonts` and swap the `<link>` in `app/layout.tsx` when convenient.
- **The Pharma page is not implemented.** The handoff marks it optional and unlinked;
  the prototype is still in the bundle if it should go live.
- **Re-verify the case-study figures before launch.** The Eli Lilly numbers are real
  public figures carrying an "as at" date, and the chart plots four labelled period
  markers with no daily price path drawn between them. Nothing on the site should be
  reworded into a performance claim, and the footer disclaimer must stay.
- **The case photograph is deliberately generic.** Do not substitute Eli Lilly
  product photography or logos.
- `metadataBase`, the sitemap and robots use `https://forwardmatter.com`. Update them
  if the production domain differs.
