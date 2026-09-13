/**
 * All site copy and structured content, lifted out of the design prototypes.
 * Editing marketing text should never mean touching a component.
 */

export const siteMeta = {
  name: "Forward Matter",
  tagline: "Automated market intelligence",
  legal: [
    "Software product. Not a financial service. Not financial product advice.",
    "© 2026 Forward Matter Pty Ltd. Trading involves risk.",
  ],
} as const;

export const hero = {
  eyebrow: "Automated market intelligence",
  titleLead: "Intelligence for what ",
  titleAccent: "moves markets next.",
  body: "Forward Matter transforms complex market signals into systematic investment decisions. Trading and portfolio intelligence software for wealth advisers, asset managers and funds.",
  ctaLabel: "Get in touch",
  secondaryLabel: "See what it does",
  particleCount: 2300,
} as const;

export const credibility = {
  label: "Built for professional investors",
  items: ["Connected intelligence", "Portfolio level control", "Governed automation"],
} as const;

export const intelligenceSystem = {
  eyebrow: "The intelligence system",
  title: "Thousands of events. Automated decision making.",
  body: "Matter Engine continuously interprets distinct information environments, then identifies the relationships that become material to markets and portfolios.",
  engine: {
    eyebrow: "Proprietary intelligence layer",
    title: "Matter Engine",
    body: "Relationship mapping, probability modelling and systematic decision infrastructure.",
    chip: "Architecture and signal logic remain proprietary",
  },
} as const;

export type EngineItem = { label: string; title: string; body: string };

export const inputs: EngineItem[] = [
  {
    label: "Scientific intelligence",
    title: "Healthcare events",
    body: "Clinical milestones, regulatory decisions, patents and commercial developments.",
  },
  {
    label: "Company intelligence",
    title: "Fundamental change",
    body: "Earnings, guidance, ownership, competitive moves and capital allocation.",
  },
  {
    label: "Market intelligence",
    title: "Price and flow",
    body: "Liquidity, volatility, positioning and institutional market behaviour.",
  },
];

export const outputs: EngineItem[] = [
  {
    label: "Signal output",
    title: "Ranked opportunities",
    body: "Expected impact, timing, confidence and risk presented for investment review.",
  },
  {
    label: "Portfolio output",
    title: "Risk aware allocation",
    body: "Position sizing and exposure shaped by institutional mandates and constraints.",
  },
  {
    label: "Execution output",
    title: "Governed action",
    body: "Automated or adviser approved execution with monitoring and oversight.",
  },
];

export type Capability = {
  title: string;
  body: string;
  lampTop: string;
  lampBottom: string;
  glow: string;
};

export const capabilities: Capability[] = [
  {
    title: "Predictive models",
    body: "Outcome probabilities for events that already have a date on them.",
    lampTop: "#6b93c4",
    lampBottom: "#345984",
    glow: "rgba(52,89,132,0.6)",
  },
  {
    title: "Real time response",
    body: "The read updates as evidence arrives, not on a weekly reporting cycle.",
    lampTop: "#9fb4c9",
    lampBottom: "#546171",
    glow: "rgba(84,97,113,0.55)",
  },
  {
    title: "Quantum optimisation",
    body: "Sizing and selection solved on quantum inspired solvers where they beat the classical benchmark.",
    lampTop: "#7fa8cf",
    lampBottom: "#44668b",
    glow: "rgba(68,102,139,0.6)",
  },
  {
    title: "Autonomous agents",
    body: "Agents watch every source around the clock and flag what changed.",
    lampTop: "#8fa2b8",
    lampBottom: "#242d38",
    glow: "rgba(36,45,56,0.5)",
  },
];

export const catalyst = {
  eyebrow: "Illustrative",
  title: "Catalysts arrive on schedule. We model every state they can resolve into.",
  intro:
    "A dated catalyst is one input among thousands. The engine weighs each possible outcome against the sentiment, flow and conditions around it, and revises as evidence lands.",
  legendNote: "Bar length indicates modelled weight in the sequence.",
} as const;

export type TimelineEvent = {
  when: string;
  label: string;
  note: string;
  weight: string;
  ring: string;
  dot: string;
  glow: string;
};

export const timeline: TimelineEvent[] = [
  {
    when: "Resolved",
    label: "Phase 3 readout",
    note: "Evidence in the record",
    weight: "82%",
    ring: "#8fb4dd",
    dot: "#5b82b4",
    glow: "rgba(143,180,221,0.55)",
  },
  {
    when: "Resolved",
    label: "Submission",
    note: "Filing accepted",
    weight: "46%",
    ring: "#8fb4dd",
    dot: "#5b82b4",
    glow: "rgba(143,180,221,0.5)",
  },
  {
    when: "Scheduled",
    label: "Decision date",
    note: "Published in advance",
    weight: "94%",
    ring: "#8fb4dd",
    dot: "transparent",
    glow: "rgba(143,180,221,0.4)",
  },
  {
    when: "Scheduled",
    label: "Launch",
    note: "Commercial ramp",
    weight: "68%",
    ring: "#8fb4dd",
    dot: "transparent",
    glow: "rgba(143,180,221,0.32)",
  },
  {
    when: "Expected",
    label: "Second market",
    note: "Same sequence repeats",
    weight: "38%",
    ring: "#6b7c90",
    dot: "transparent",
    glow: "rgba(107,124,144,0.28)",
  },
  {
    when: "Expected",
    label: "Label expansion",
    note: "Addressable market widens",
    weight: "24%",
    ring: "#6b7c90",
    dot: "transparent",
    glow: "rgba(107,124,144,0.22)",
  },
];

export const platformSection = {
  eyebrow: "The Matter family",
  title: "One platform. Specialist capabilities.",
  body: "Research, modelling and portfolio tools designed to work across the investment process.",
} as const;

export type PlatformGroup = { group: string; items: { name: string; body: string }[] };

export const platform: PlatformGroup[] = [
  {
    group: "Research and strategy",
    items: [
      { name: "Matter Intelligence", body: "Research, signal detection and forecasting." },
      { name: "Matter Engine", body: "Modelling and automated strategy infrastructure." },
      { name: "Matter Portfolio", body: "Portfolio construction and risk management." },
    ],
  },
  {
    group: "Specialist intelligence",
    items: [
      { name: "Matter Health", body: "Healthcare and life sciences intelligence." },
      { name: "Matter Markets", body: "Emerging market and macro intelligence." },
    ],
  },
  {
    group: "Access and integration",
    items: [
      { name: "Matter API", body: "Institutional data and software integration." },
      {
        name: "Matter Terminal",
        body: "A professional interface for analysts and portfolio managers.",
      },
    ],
  },
];

export const caseStudy = {
  eyebrow: "Eli Lilly and tirzepatide",
  title: "One molecule, every catalyst dated in advance.",
  body: "Tirzepatide's approvals, indications and earnings dates were all published before they happened. Lilly's shares went from an average of $152.16 across November and December 2020 to $1,149.36 on 4 September 2026, and the company passed a trillion dollars of market value on 21 November 2025.",
  chartTitle: "LLY closing price, US dollars",
  chartSource: "Public market data",
  chartAlt:
    "Eli Lilly closing price rising from 152 dollars in 2020 to 1149 dollars in 2026, shown as four plotted points",
  asAt:
    "Figures as at 4 September 2026. The four points are period markers, not a daily price path.",
  criteriaHead: "Why this is where we deploy",
  points: [
    { label: "Dec 2020", value: "$152" },
    { label: "May 2022", value: "Mounjaro" },
    { label: "Nov 2023", value: "$587" },
    { label: "Sep 2026", value: "$1,149" },
  ],
  criteria: [
    {
      lead: "The catalysts are dated.",
      body: "Trial readouts, regulatory decisions and earnings sit on a published calendar, so the model knows what is coming and when.",
    },
    {
      lead: "The evidence is documented.",
      body: "Protocols, filings, labels and transcripts are public text, which is what our models read at scale.",
    },
    {
      lead: "The sequence repeats.",
      body: "Orforglipron and retatrutide follow the same path tirzepatide did, so the structure learned on one asset transfers to the next.",
    },
  ],
} as const;

export const closing = {
  eyebrow: "Why we exist",
  title: "More of the future is knowable than the market assumes.",
  body: "A great deal of what will move a market is already documented, dated and discussed in public. We exist to make that readable, so a decision rests on evidence rather than instinct. Talk to us about how that could extend your firm, platform or fund.",
  teamLink: "Josh, Dion and Adam",
} as const;

export type Person = {
  slug: string;
  photo: string;
  name: string;
  role: string;
  owns: string;
  body: string;
};

export const people: Person[] = [
  {
    slug: "josh",
    photo: "/people/josh.webp",
    name: "Josh Peacock",
    role: "Technology",
    owns: "The product, the technology and the user experience.",
    body: "Fifteen years building automation, bots and growth technology for large brands, including McDonald's, Netflix, Red Bull, Airbnb and Accor. Owns the architecture and the interface, and builds them in house rather than buying either.",
  },
  {
    slug: "dion",
    photo: "/people/dion.webp",
    name: "Dion Couch",
    role: "Insight",
    owns: "Industry insight, with pharmaceuticals as the specialist domain.",
    body: "Two biochemistry degrees and years spent inside the science, where outcomes are measured rather than discussed. Provides the read on what a clinical or regulatory development actually means, which is the judgement no data feed supplies.",
  },
  {
    slug: "adam",
    photo: "/people/adam.webp",
    name: "Adam Mazzaferro",
    role: "Corporate",
    owns: "Financial structure, commercial terms and regulatory position.",
    body: "Commercial lawyer working across finance and regulated industry, on corporate structure, capital and transactions. Handles how the business is structured, how licences are written and where the regulatory boundaries sit.",
  },
];

export const aboutPage = {
  eyebrow: "About us",
  titleLead: "Why we built ",
  titleAccent: "Forward Matter.",
  body: "A small Sydney company, started because the hardest part of an investment decision was never getting the information. It was reading enough of it, closely enough, in time to matter.",
  why: {
    eyebrow: "Why we exist",
    title: "Some of the future is already scheduled.",
    paragraphs: [
      "Most information arrives as a surprise. But a meaningful share of it doesn't: a regulatory decision date, a trial completion, an earnings call, a policy review. Those events are published in advance, documented in the public record, and then discussed at length by people with opinions.",
      "Reading all of that properly is a software problem, not a headcount problem. So we built the software, and because we run it on our own book it is judged on whether it works rather than on how it demonstrates. We are a small team in Sydney, deliberately narrow, going deep in a few industries instead of wide across all of them.",
    ],
  },
  team: {
    eyebrow: "The team",
    title: "A Sydney team building at the front of industry technology.",
    body: "Software alone cannot tell you what a clinical result means, and expertise alone cannot read ten thousand documents a day. So the company was built with all three sides in the room from the start.",
  },
  cta: {
    title: "See what becomes material before the market fully responds.",
    body: "Talk to us about how Forward Matter could extend the intelligence and execution capability of your advisory firm, platform or fund.",
    label: "Speak to us",
  },
} as const;

export type ContactField = {
  label: string;
  name: string;
  type: "text" | "email";
  placeholder: string;
  required: boolean;
};

export const contactFields: ContactField[] = [
  { label: "Name", name: "name", type: "text", placeholder: "Full name", required: true },
  { label: "Firm", name: "firm", type: "text", placeholder: "Entity name", required: true },
  { label: "Email", name: "email", type: "email", placeholder: "name@firm.com", required: true },
  { label: "Role", name: "role", type: "text", placeholder: "Your title", required: false },
];

export const orgTypes = [
  "Select one",
  "Financial services firm",
  "Pharmaceutical or healthcare",
  "Proprietary trading desk",
  "Technology partner",
  "Other",
];

export const contactCopy = {
  messageLabel: "Message",
  messagePlaceholder: "What you are looking to license, and the timeframe you are working to.",
  submitLabel: "Speak to us",
  note: "All enquiries handled confidentially.",
  thanksTitle: "Thank you.",
  thanksBody:
    "Your enquiry has been received. We will come back to you with next steps and the technical overview.",
  // Shown only by a static preview that has no endpoint to post to, so nobody
  // believes an enquiry reached us when it went nowhere.
  thanksPreview:
    "This is a design preview, so the enquiry was not sent anywhere. On the live site it reaches the Forward Matter inbox.",
} as const;
