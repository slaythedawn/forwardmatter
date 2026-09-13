# Handoff: Forward Matter marketing site

## Overview
A three-page marketing site for **Forward Matter**, a Sydney software company that builds automated market-intelligence software for financial services and the pharmaceutical industry. The site positions the company, explains the intelligence system and product family, proves the thesis with a worked example (Eli Lilly / tirzepatide), introduces the three founders, and captures enquiries through a contact form.

Pages:
1. **Home** — hero with an animated particle "brain", the intelligence system, a dark catalyst-timeline panel, the Matter product family, the Eli Lilly case study, and a combined purpose + team + contact close.
2. **About us** — why the company exists, the firm, the three people, contact.
3. **Pharma** (optional, currently unlinked) — a deeper industry page kept in the bundle for reference.

## About the Design Files
The files in this bundle are **design references created in HTML**. They are prototypes that show the intended look, copy and behaviour — they are **not production code to lift directly**.

They are authored in a bespoke template runtime (`support.js`, `<x-dc>` custom element, `{{ }}` holes, `<sc-for>` / `<sc-if>` control-flow tags, `style-hover` / `style-active` / `style-focus` pseudo-state attributes). That runtime is a design tool, **not something to ship**. Every style is inline by design, which is a constraint of the authoring environment rather than a recommendation.

**The task is to recreate these designs in the target codebase's own environment** — React/Next, Vue, Astro, plain HTML+CSS, whatever the project uses — with its established patterns, component structure and styling approach. If no codebase exists yet, choose the most appropriate framework (a static site generator or Next.js suits this content) and implement there. Translate:
- `{{ value }}` holes → props/variables (the data arrays are all in the `class Component` block at the bottom of each file)
- `<sc-for list={{ items }} as="x">` → `.map()` or `v-for`
- `<sc-if value={{ flag }}>` → conditional render
- `style-hover="…"` → `:hover` rules in CSS/Tailwind/styled-components
- inline `style="…"` → CSS classes, utility classes or design tokens

## Fidelity
**High fidelity.** Colours, typography, spacing, radii, shadows and copy are final and should be reproduced precisely. The visual language is a deliberate, heavy **neumorphic / skeuomorphic** treatment on a light grey ground — raised panels with a white top-left highlight and a grey bottom-right drop shadow, recessed "wells" with inset shadows, physical-feeling buttons that depress on `:active`, and `text-shadow: 0 1px #fff` on most type to give an embossed edge. Getting the shadow recipes right is the single most important part of the recreation; they are listed verbatim under Design Tokens.

---

## Screens / Views

### Shared shell (all pages)

**Container**
- `width: min(1240px, calc(100% - 72px)); margin: 0 auto`
- Page background `#eef0f3`, body text `#242d38`, `overflow-x: hidden`, `html { scrollbar-gutter: stable }` (this prevents a horizontal jump between pages of different height — keep it)
- `box-sizing: border-box` on everything
- Links: default `#242d38`, hover `#345984`, no underline

**Header** (sticky)
- `position: sticky; top: 0; z-index: 30`, `min-height: 110px`, `padding: 26px 0`
- Background `rgba(238,240,243,0.88)` with `backdrop-filter: blur(10px)`, hairline under it: `box-shadow: 0 1px 0 rgba(198,206,215,0.9)`
- Flex row, `justify-content: space-between`, `gap: 24px`, wraps
- **Logo lockup**: 58×58 rounded tile (`border-radius: 17px`, `padding: 12px 9px`, `border: 1px solid #d2d8e0`, `background: linear-gradient(145deg,#fff 0%,#e9edf1 56%,#d7dee6 100%)`, `box-shadow: 1px 2px 1px #bdc6d0, 6px 7px 13px #ccd3db, -5px -5px 12px #fff, inset 1px 1px 1px #fff`) containing the FM brain mark (see Assets), then the wordmark "Forward Matter" at `17px/700`, `letter-spacing: -0.015em`, `text-shadow: 0 1px #fff`
- **Nav**: Technology, Platform, About us at `14px` `#546171`; current page is `#242d38` at weight 600; then the primary Contact button
- On About and Pharma, Technology and Platform link cross-page to `Home#technology` / `Home#platform`

**Primary button** (header CTA, hero CTA, form submit)
- `min-height: 54px` (50px in the header), `padding: 14px 24px`, `border-radius: 13px`, `font-size: 15px`, `font-weight: 600`, white text
- `border: 1px solid #283441` with `border-bottom-color: #182331`
- `background: linear-gradient(180deg,#465363,#293543)`
- `box-shadow: 0 3px 0 #172432, 5px 9px 15px #c8d1dc, -5px -5px 12px #fff, inset 0 1px 1px #8390a0`
- `text-shadow: 0 -1px #1a2533`
- Hover: `background: linear-gradient(#536174,#344356)`
- Active: `transform: translateY(2px); box-shadow: inset 3px 3px 7px #17222e, 0 1px 0 #fff` (the button physically presses in — keep this)
- Contains a 17px arrow glyph: `<path d="M3 10h13m-5-5 5 5-5 5" stroke="currentColor" stroke-width="1.5" fill="none"/>` in a `0 0 20 20` viewBox

**Secondary button** (e.g. "Meet the team")
- Same geometry, but `color: #242d38`, `border: 1px solid #c2ccd7` with `border-bottom: 3px solid #b5c1ce`, `background: linear-gradient(145deg,#fafbfd,#e1e6ec)`, `box-shadow: inset 1px 2px #fff, 5px 7px 13px #c7d0db, -5px -5px 12px #fff`
- Hover: `background: linear-gradient(145deg,#fff,#e7ebf1); color: #345984`

**Footer**
- `padding: 32px 0 38px`, `border-top: 1px solid #c6ced7`, flex row wrapping
- Left: small FM mark (38×32) + "Forward Matter" at `15px/700`
- Middle: nav links at `14px` `#546171`
- Right, right-aligned, `12px/1.8` `#546171`: "Software product. Not a financial service. Not financial product advice." / "© 2026 Forward Matter Pty Ltd. Trading involves risk."

---

### 1. Home — `Forward Matter Home.dc.html`

**Hero** — `padding: 64px 0 78px`, two-column grid `repeat(auto-fit, minmax(min(100%,420px),1fr))`, `gap: 52px`, `align-items: center`
- Eyebrow: "AUTOMATED MARKET INTELLIGENCE" — `13px`, `letter-spacing: .11em`, uppercase, `#546171`, `text-shadow: 0 1px #fff`
- H1: "Intelligence for what **moves markets next.**" — `clamp(44px,5.4vw,82px)`, weight 600, `line-height: 1.035`, `letter-spacing: -0.055em`, `max-width: 17ch`, `text-shadow: 0 2px 1px #fff, 0 -1px 0 rgba(36,45,56,0.12)`. The second sentence fragment is wrapped in a span coloured `#345984`.
- Body: "Forward Matter transforms complex market signals into systematic investment decisions. Trading and portfolio intelligence software for wealth advisers, asset managers and funds." — `18px/1.65`, `#546171`, `max-width: 47ch`
- CTA row: primary "Get in touch" → `#contact`; text link "See what it does" → `#technology` with `text-decoration: underline; text-underline-offset: 6px; text-decoration-color: #919dab`
- Right column: the **brain-field animation** (see Assets) in a box of `height: clamp(360px,42vw,520px)`, sitting over a soft radial highlight (`radial-gradient(circle at 42% 36%, #fff 0%, rgba(255,255,255,.6) 40%, rgba(198,206,215,.28) 70%, rgba(238,240,243,0) 84%)`, 62% width, centred). Beneath it a small recessed pill: "Signals → Matter Engine → **Probability**" (last item `#345984`, weight 600) with `padding: 11px 17px`, `border-radius: 11px`, `background: #e1e7ee`, `box-shadow: inset 1px 2px 4px #bfccd9, 0 1px #fff`

**Credibility strip** — full-width row between hairlines (`border-top`/`border-bottom: 1px solid #c6ced7`), `padding: 29px 0`. Left: "BUILT FOR PROFESSIONAL INVESTORS" (`12px`, .11em, uppercase, `#242d38`, weight 600). Right: three `16px` `#546171` items with `gap: 38px` — Connected intelligence · Portfolio level control · Governed automation.

**02 — The intelligence system** (`id="technology"`, `padding: 96px 0`)
- Section head: three-track grid, left cell holds the eyebrow "01 / THE INTELLIGENCE SYSTEM", right cell spans 2 tracks and holds H2 "Thousands of events. Automated decision making." (`clamp(34px,4.15vw,62px)`, `line-height: 1.1`, `letter-spacing: -0.045em`, `max-width: 18ch`) plus a `17px/1.65` paragraph, `max-width: 60ch`
- **The engine well**: a deeply recessed panel — `border-radius: 30px`, `border: 1px solid #cbd2dc` with `border-bottom-color`/`border-right-color: #fff`, `background: linear-gradient(135deg,#e3e7ed,#edf0f4)`, `box-shadow: inset 5px 5px 14px #c4cdd9, inset -5px -5px 12px #fff`, `padding: clamp(22px,3vw,36px)`. Grid `repeat(auto-fit, minmax(min(100%,205px),1fr))`, `gap: 26px` — three equal tracks at desktop: **inputs → engine card → outputs**.
  - Inputs column, heading "INTELLIGENCE INPUTS", then three items each separated by `border-top: 1px solid #c6ced7`, `padding: 18px 0`: a `11px` .11em uppercase `#345984` weight-600 label, a `16px` weight-600 title, a `15px/1.55` `#546171` body. Content: Scientific intelligence / Healthcare events / "Clinical milestones, regulatory decisions, patents and commercial developments." · Company intelligence / Fundamental change / "Earnings, guidance, ownership, competitive moves and capital allocation." · Market intelligence / Price and flow / "Liquidity, volatility, positioning and institutional market behaviour."
  - Centre card (raised out of the well): `border-radius: 21px`, `border: 1px solid #c2ccd7`, `border-bottom: 4px solid #b5c1ce`, background is a 3px scanline over a gradient — `repeating-linear-gradient(0deg, rgba(255,255,255,.13) 0 1px, transparent 1px 3px), linear-gradient(145deg,#fafbfd,#e1e6ec)` — `box-shadow: inset 1px 2px #fff, 8px 12px 17px #bdc8d5, -7px -7px 17px #fff`. Inside: a 92×92 inset tile holding the FM mark, eyebrow "PROPRIETARY INTELLIGENCE LAYER" (`#345984`), H3 "Matter Engine" (`22px`, `-0.025em`), a `15px/1.6` description, and a small chip "Architecture and signal logic remain proprietary".
  - Outputs column, heading "DECISION OUTPUTS", same item pattern: Signal output / Ranked opportunities · Portfolio output / Risk aware allocation · Execution output / Governed action.
- **Capability tiles** — grid `repeat(auto-fit, minmax(min(100%,235px),1fr))`, `gap: 22px`, `margin-top: 30px`. Each is a raised card (`border-radius: 20px`, `border: 1px solid #c9d2dc`, `border-bottom: 3px solid #bbc7d4`, `background: linear-gradient(145deg,#fafcfd,#e4e9ef)`, `box-shadow: inset 1px 1px #fff, 12px 14px 28px #c7ced7, -12px -12px 25px #fff`, `padding: 26px 24px 28px`) with a 46×46 rounded bezel holding a glowing 13px "LED" (`background: linear-gradient(180deg, lampTop, lampBottom)`, `box-shadow: 0 0 7px glow, inset 0 1px 0 rgba(255,255,255,.55), inset 0 -1px 2px rgba(0,0,0,.3)`), an `18px` title and a `15px/1.55` body. Four tiles with their LED colours:
  | Title | Body | lampTop | lampBottom | glow |
  |---|---|---|---|---|
  | Predictive models | Outcome probabilities for events that already have a date on them. | #6b93c4 | #345984 | rgba(52,89,132,.6) |
  | Real time response | The read updates as evidence arrives, not on a weekly reporting cycle. | #9fb4c9 | #546171 | rgba(84,97,113,.55) |
  | Quantum optimisation | Sizing and selection solved on quantum inspired solvers where they beat the classical benchmark. | #7fa8cf | #44668b | rgba(68,102,139,.6) |
  | Autonomous agents | Agents watch every source around the clock and flag what changed. | #8fa2b8 | #242d38 | rgba(36,45,56,.5) |

**Catalyst timeline panel** (the one dark section — it deliberately interrupts the light rhythm)
- `border-radius: 30px`, `border: 1px solid #1b232e`, `background: linear-gradient(165deg,#33404f 0%,#242e3a 52%,#1b232d 100%)`, `box-shadow: inset 0 1px 0 rgba(255,255,255,.16), inset 0 -3px 8px rgba(0,0,0,.5), 0 22px 44px rgba(36,45,56,.28)`, `padding: clamp(30px,4vw,54px) clamp(24px,3.4vw,48px)`, `overflow: hidden`
- A 48px vertical rule overlay across the whole panel: `repeating-linear-gradient(90deg, rgba(255,255,255,.03) 0 1px, transparent 1px 48px)`, `pointer-events: none`
- Head row: eyebrow "ILLUSTRATIVE" (`#93a6bb`) + H2 "Catalysts arrive on schedule. We model every state they can resolve into." (`clamp(26px,3.2vw,42px)`, `#f2f5f8`, `max-width: 20ch`), and to the right a `15px/1.6` `#aebbca` paragraph at `max-width: 34ch`
- Timeline: an absolutely positioned 2px axis at `top: 10px`, `left/right: 10px` with a fading gradient; over it a grid `repeat(auto-fit, minmax(min(50%,118px),1fr))`, `gap: 26px 16px`. Each event is a column: a 22px node (2px ring, `box-shadow: 0 0 0 6px #222b36, 0 0 14px glow` — the 6px ring in the panel colour is what punches the node through the axis), an `11px` uppercase state label, a `14px` weight-600 name, a 6px weight bar in a recessed track (`background: rgba(255,255,255,.07)`, `box-shadow: inset 0 1px 2px rgba(0,0,0,.55)`) filled `linear-gradient(90deg,#5b82b4,#8fb4dd)`, and a `12px` note. Six events: Phase 3 readout (Resolved, 82%) · Submission (Resolved, 46%) · Decision date (Scheduled, 94%) · Launch (Scheduled, 68%) · Second market (Expected, 38%) · Label expansion (Expected, 24%). Resolved nodes are filled `#5b82b4` with ring `#8fb4dd`; Scheduled are hollow with ring `#8fb4dd`; Expected are hollow with ring `#6b7c90`.
- Legend row above a `1px solid rgba(147,166,187,.22)` top border: Resolved / Scheduled / Expected swatches, plus a right-aligned note "Bar length indicates modelled weight in the sequence."

**The Matter family** (`id="platform"`)
- Same head pattern; eyebrow "THE MATTER FAMILY", H2 "One platform. Specialist capabilities." (`max-width: 30ch` so it sets on two lines), `17px` sub-line
- A raised panel with a header strip (FM mark + wordmark on the left, "AUTOMATED MARKET INTELLIGENCE" on the right, separated by `border-bottom: 1px solid #c6ced7`, `padding-bottom: 22px`), then a three-column grid `repeat(auto-fit, minmax(min(100%,230px),1fr))`, `gap: 30px`:
  - **Research and strategy**: Matter Intelligence (Research, signal detection and forecasting.) · Matter Engine (Modelling and automated strategy infrastructure.) · Matter Portfolio (Portfolio construction and risk management.)
  - **Specialist intelligence**: Matter Health (Healthcare and life sciences intelligence.) · Matter Markets (Emerging market and macro intelligence.)
  - **Access and integration**: Matter API (Institutional data and software integration.) · Matter Terminal (A professional interface for analysts and portfolio managers.)

**Case study — Eli Lilly and tirzepatide**
- One raised container with `overflow: hidden` and `gap: 0`, split `repeat(auto-fit, minmax(min(100%,320px),1fr))`
- Left: full-bleed image `media/case-vial.png` (`object-fit: cover`, `object-position: 60% center`, `min-height: clamp(280px,30vw,420px)`) with a frosted "CASE STUDY" tag pinned bottom-left (`rgba(244,246,249,.9)` + `backdrop-filter: blur(6px)`)
- Right, `padding: clamp(28px,3.2vw,44px)`: eyebrow "ELI LILLY AND TIRZEPATIDE", H2 "One molecule, every catalyst dated in advance." (`clamp(24px,2.8vw,38px)`), then the body paragraph containing the real figures
- **Chart**: a recessed well containing an inline SVG (`viewBox="0 0 300 100"`, `preserveAspectRatio="none"`, `height: 92px`). Area fill uses a vertical gradient `#5b82b4` at `.42` → `.04`; line is `#345984` 2px with `vector-effect: non-scaling-stroke` (needed because the viewBox is stretched). Four plotted points, then a four-column label row beneath.
- **Criteria list** headed "WHY THIS IS WHERE WE DEPLOY" — three bullets with a 6px `#345984` glowing dot, a bold lead and body: "The catalysts are dated." / "The evidence is documented." / "The sequence repeats."

**Closing block** (`id="contact"`) — purpose, team and contact combined into one section
- Two columns, `gap: 52px`, `align-items: start`
- Left: eyebrow "WHY WE EXIST", H2 "More of the future is knowable than the market assumes." (`clamp(32px,3.9vw,56px)`, `max-width: 18ch`), a `17px/1.65` paragraph, then a recessed strip containing the three founder avatars **overlapped** (46px circles, `margin-right: -12px`, each in a raised ring) and a `15px` weight-600 `#345984` link "Josh, Dion and Adam →" to the About page
- Right: the enquiry form in a raised panel — fields grid `repeat(auto-fit, minmax(min(100%,190px),1fr))`, `gap: 18px`. Name, Firm, Email (all required), Role (optional); then a full-width Organisation type select and a full-width Message textarea (4 rows). Inputs are recessed: `min-height: 48px`, `border-radius: 12px`, `border: 1px solid #c7d0db`, `background: #e6ebf0`, `box-shadow: inset 2px 3px 6px #c3cfdb, 0 1px #fff`; focus adds `border-color: #345984` and `0 0 0 3px rgba(52,89,132,.16)`. Submit is the primary button labelled "Speak to us", with "All enquiries handled confidentially." beside it.
- On submit the form is replaced in place by a thank-you panel: H3 "Thank you." and "Your enquiry has been received. We will come back to you with next steps and the technical overview."

---

### 2. About us — `Forward Matter About.dc.html`

- **Hero**: single full-width typographic column (no animation here — the brain belongs to the home page only). Eyebrow "ABOUT US", H1 "Why we built **Forward Matter.**" (second part `#345984`), `max-width: 20ch`; body paragraph at `max-width: 56ch`.
- **Why we exist**: a raised panel, `padding: 52px 54px`, `border-radius: 31px`, two columns with `gap: 70px` — left holds the eyebrow and H2 "Some of the future is already scheduled."; right holds two `17px/1.65` paragraphs.
- **The team** (`id="people"`): head pattern with H2 "A Sydney team building at the front of industry technology." and a supporting paragraph. Then three raised cards, grid `repeat(auto-fit, minmax(min(100%,290px),1fr))`, `gap: 22px`. Each card: a 72px circular portrait in a raised bezel beside the name (`21px`, `-0.025em`) and role (`13px`, weight 600, `#345984`, `line-height: 1.45`, **`min-height: 2.9em` so all three roles reserve two lines and the dividers align**); then a divider, an "OWNS" label, and the bio.
  - Josh Peacock — "Co-founder, product and technology"
  - Dion Couch — "Co-founder, science and industry insight"
  - Adam Mazzaferro — "Partner, finance and corporate structure"
- **Contact**: identical to the home page's contact column and form (same headline, same fields), so the two can share one component.

### 3. Pharma — `Forward Matter Pharma.dc.html`
Deeper industry page, currently not linked from the nav or footer. Included for reference; implement only if the client wants it live.

---

## Interactions & Behavior
- **Nav anchors** — `#technology`, `#platform`, `#contact` scroll within Home; About/Pharma link cross-page to `Home#technology` etc.
- **Sticky header** — stays at the top of every page; content passes beneath the translucent blurred ground.
- **Buttons** — hover lightens the gradient; `:active` translates the button down 2px and swaps the outer shadow for an inset one, so it reads as physically pressed. Apply the same to the submit button.
- **Form** — client-side only in the prototype: submit is prevented, local `sent` state flips, and the field grid is replaced by the thank-you message. In production wire this to the real endpoint, validate on the server, and keep the in-place success state. Required: name, firm, email (type=email). Optional: role, organisation type, message.
- **Brain animation** — canvas particle field; drifts and tilts subtly on scroll and holds a slow ambient rotation independently. Purely decorative: it must never block interaction and should degrade to the static radial highlight if canvas is unavailable or `prefers-reduced-motion` is set (the prototype does not implement the reduced-motion guard — **add it**).
- **Responsive** — every section is a `repeat(auto-fit, minmax(min(100%, Npx), 1fr))` grid, so columns collapse to one at narrow widths with no media queries. Preserve the `min(100%, …)` inside `minmax` — a bare floor causes the row to overflow its container instead of collapsing. Headings use `clamp()` and need no breakpoints.
- **Accessibility to fix in production** — the avatar circles are `role="img"` with `aria-label`; the decorative SVGs are `aria-hidden`. Add visible focus styles for keyboard users (the prototype only styles `:focus` on inputs), and check the `#546171` body colour on `#eef0f3` (passes at body sizes).

## State Management
Almost none. Per page:
- `sent: boolean` — contact form submitted, toggles the thank-you panel.
- All content (inputs, outputs, capabilities, timeline events, platform groups, team, form fields, org types) is static data, held as arrays at the bottom of each file inside `class Component { renderVals() { … } }`. Lift these into a content file, CMS or constants module.
- Two tweakable props exist on Home, useful as config: `particleCount` (default 2300, range 600–3200) and `ctaLabel` (default "Get in touch").

## Design Tokens

**Colour**
| Token | Value | Use |
|---|---|---|
| ground | `#eef0f3` | page background |
| ink | `#242d38` | headings, primary text |
| muted | `#546171` | body copy, eyebrows, nav |
| accent | `#345984` | links, labels, highlighted headline fragment |
| accent-mid | `#5b82b4` | chart line fill, bar gradient start |
| accent-light | `#8fb4dd` | bar gradient end, timeline rings |
| surface-raised | `linear-gradient(145deg,#fafcfd,#e4e9ef)` | raised cards |
| surface-panel | `linear-gradient(145deg,#f8fafc,#e4e9ef)` | large raised panels |
| surface-well | `#e6ebf0` | recessed wells, inputs |
| surface-well-deep | `linear-gradient(135deg,#e3e7ed,#edf0f4)` | the engine well |
| hairline | `#c6ced7` | section rules, list dividers |
| border-soft | `#c7d0db` / `#c9d2dc` / `#d0d7e0` | well, card, panel borders |
| dark-panel | `linear-gradient(165deg,#33404f,#242e3a 52%,#1b232d)` | catalyst panel |
| dark-ink | `#f2f5f8` | headings on dark |
| dark-body | `#aebbca` | body on dark |
| dark-muted | `#93a6bb` | labels on dark |

**Typography** — Switzer (Fontshare), weights 300–700, fallback `ui-sans-serif, system-ui, -apple-system, sans-serif`, `-webkit-font-smoothing: antialiased`
| Role | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| H1 | `clamp(44px,5.4vw,82px)` | 600 | 1.035 | -0.055em |
| H2 | `clamp(34px,4.15vw,62px)` | 600 | 1.1 | -0.045em |
| H2 (small/dark) | `clamp(24px,2.8vw,42px)` | 600 | 1.1–1.12 | -0.04em |
| H3 | 18–22px | 600 | 1.25 | -0.015 to -0.025em |
| Lead body | 17–18px | 400 | 1.65 | — |
| Body | 15–16px | 400 | 1.55–1.6 | — |
| Eyebrow | 12–13px | 400/600 | — | 0.11em, uppercase |
| Caption | 11–12px | 400 | 1.35–1.5 | — |

All headings and most labels on the light ground carry `text-shadow: 0 1px #fff` (H1/H2 use `0 2px 1px #fff`) — this is the embossing and is not optional to the look. `text-wrap: pretty` is set on most headings and paragraphs.

**Spacing** — section rhythm `96px` between major sections (`padding: 96px 0` or `0 0 96px` with a `96px` top margin after a hairline); head-to-content `46px`; card padding `26–32px`; panel padding `clamp(24px,3vw,38px)`; grid gaps 18/22/26/30/44/52/56/70px.

**Radii** — 10, 11, 12, 13 (buttons), 14, 16, 17 (logo tile), 18, 20 (cards), 21, 24, 26, 30–31 (large panels), 50% (avatars).

**Shadows** — the core of the style, use verbatim:
- Raised card: `inset 1px 1px #fff, 12px 14px 28px #c7ced7, -12px -12px 25px #fff`
- Raised panel: `inset 1px 1px #fff, 12px 16px 28px #ccd4dd, -12px -12px 25px #fff`
- Recessed well: `inset 2px 3px 6px #c3cfdb, 0 1px #fff`
- Deep well: `inset 5px 5px 14px #c4cdd9, inset -5px -5px 12px #fff`
- Small inset pill: `inset 1px 2px 4px #bfccd9, 0 1px #fff`
- Raised bezel (avatars, icon tiles): `0 2px 1px #c1cbd7, 5px 7px 12px #cbd3dc, -5px -5px 12px #fff, inset 1px 1px #fff`
- Primary button: `0 3px 0 #172432, 5px 9px 15px #c8d1dc, -5px -5px 12px #fff, inset 0 1px 1px #8390a0`
- Pressed: `inset 3px 3px 7px #17222e, 0 1px 0 #fff` (dark) / `inset 3px 3px 7px #c0cbd8, 0 1px 0 #fff` (light)
- Dark panel: `inset 0 1px 0 rgba(255,255,255,.16), inset 0 -3px 8px rgba(0,0,0,.5), 0 22px 44px rgba(36,45,56,.28)`

Raised elements also use asymmetric borders — a darker `border-bottom` (2–4px) and, on wells, white `border-right`/`border-bottom` — to fake a light source from the top left. Keep that direction consistent everywhere.

## Assets
| Asset | Path | Notes |
|---|---|---|
| FM brain mark | inline SVG in each file | `viewBox="0 0 48 40"`; one `path` (the lobed cranium outline, `stroke: #242d38`, `stroke-width: 2.4`, round caps/joins) plus a `<text>` "FM" at `x=24 y=24`, `font-size: 13.5`, weight 700, `letter-spacing: -0.4`, centred. **Convert the text to outlines** before shipping so it doesn't depend on Switzer loading. Used at 58px (header tile), 92px (engine card), 38×32 (footer), 36×30 (platform strip). |
| Brain particle animation | `brain-field.js` | Self-registering `<brain-field>` web component, canvas-based. Attributes: `count` (particle count), `palette="steel"`, `fill="1.28"`. Home hero only. Port or re-implement; it has no dependencies. |
| Founder portraits | `people/josh.png`, `people/dion.png`, `people/adam.png` | Supplied by the client. Rendered as `background-size: cover; background-position: center 22%` inside circles. |
| Case study photograph | `media/case-vial.png` | AI-generated (Higgsfield) editorial still life of an **unbranded** vial and injector pen. Deliberately generic — do **not** substitute Eli Lilly product photography or logos without their permission. |
| Unused alternates | `media/visual-a.png`, `media/visual-b.png` | Earlier image explorations, not referenced by any page. |
| Typeface | Switzer | Loaded from `https://api.fontshare.com/v2/css?f[]=switzer@300,400,500,600,700&display=swap` with a `preconnect`. Self-host for production. |

## Content accuracy — read before shipping
The case study cites **real public figures**: Lilly's average close across Nov–Dec 2020 was `$152.16` and across Nov–Dec 2023 `$587.42` (both from Lilly's own proxy statement); the close on 4 September 2026 was `$1,149.36`; the company passed $1T of market value on 21 November 2025; Mounjaro (tirzepatide) was FDA-approved May 2022 and Zepbound November 2023. **The line drawn between the four plotted points is a straight interpolation, not the daily price path** — either redraw it from a real series or keep the four labelled points only. Re-verify every figure at launch and consider adding an "as at" date.

The footer disclaimer ("Software product. Not a financial service. Not financial product advice.") is deliberate and must stay. Nothing on the site should be reworded into performance claims or advice.

## Files
| File | Contents |
|---|---|
| `Forward Matter Home.dc.html` | Home page — hero, intelligence system, catalyst panel, platform, case study, closing block |
| `Forward Matter About.dc.html` | About page — hero, why we exist, team, contact |
| `Forward Matter Pharma.dc.html` | Pharma industry page (unlinked) |
| `Forward Matter Brand.dc.html` | Brand/style reference sheet |
| `brain-field.js` | Particle animation web component |
| `support.js` | Design-tool runtime — **prototype only, do not ship** |
| `people/`, `media/` | Images |

Open any `.dc.html` in a browser to see the design running.
