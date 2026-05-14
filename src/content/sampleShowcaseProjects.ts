/**
 * Fictional showcase entries for the marketing /projects page only.
 * Routes: /projects/showcase/:slug — kept separate from real /projects/:id listings.
 */

export type SampleShowcaseProject = {
  slug: string;
  title: string;
  company: string;
  summary: string;
  duration: string;
  skills: string;
  imageSrc: string;
  imageAlt: string;
  overview: string;
  deliverables: string[];
  idealFor: string;
};

export const SAMPLE_SHOWCASE_PROJECTS: SampleShowcaseProject[] = [
  {
    slug: "brand-refresh-fintech",
    title: "Lightweight brand refresh",
    company: "Example: early-stage fintech",
    summary:
      "Logo refinements, colour system, and a one-page style guide—ideal for a design student building a branding case study.",
    duration: "2–3 weeks",
    skills: "Brand, Figma",
    imageSrc:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&h=600&fit=crop&q=80",
    imageAlt: "Design workspace with colour swatches and sketches",
    overview:
      "A fictitious payments startup wants to look more trustworthy without a full rebrand. You refine the wordmark, define primary and secondary colours, and document spacing and type rules in a single Figma file the team can reuse.",
    deliverables: [
      "Updated logo usage (minimum clear space, light/dark)",
      "8-colour palette with accessibility notes",
      "One-page PDF / Figma brand cheatsheet",
    ],
    idealFor: "Visual design, branding, or UI students who want a polished case study.",
  },
  {
    slug: "social-content-wellness",
    title: "Social content pack",
    company: "Example: D2C wellness brand",
    summary:
      "Ten carousel posts and three short scripts aligned to an existing tone of voice; great for marketing or copy portfolios.",
    duration: "2 weeks",
    skills: "Content, Canva / CapCut",
    imageSrc:
      "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=900&h=600&fit=crop&q=80",
    imageAlt: "Phone showing social media interface",
    overview:
      "The brand already has guidelines. Your job is to turn weekly themes into scroll-stopping carousels and short vertical video scripts their intern can film.",
    deliverables: [
      "10 carousel storyboards (copy + layout direction)",
      "3 x 30–45s Reels scripts with hook / CTA",
      "Simple content calendar for one month",
    ],
    idealFor: "Marketing, communications, or content students.",
  },
  {
    slug: "ux-audit-saas",
    title: "UX audit & recommendations",
    company: "Example: B2B SaaS onboarding",
    summary:
      "Heuristic review of signup → first value, annotated screens, and a short report with prioritized fixes.",
    duration: "1–2 weeks",
    skills: "UX research, Figma",
    imageSrc:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=900&h=600&fit=crop&q=80",
    imageAlt: "Designer working on UX wireframes and user flows on screen",
    overview:
      "Walk through the live product as a new user, apply standard usability heuristics, and produce actionable fixes the engineering team can schedule.",
    deliverables: [
      "Annotated screenshots in Figma",
      "Prioritized issue list (severity + effort)",
      "3-page summary with recommended next sprint",
    ],
    idealFor: "UX, product design, or HCI students.",
  },
  {
    slug: "mobile-ui-component-library",
    title: "Mobile UI component pass",
    company: "Example: edtech quiz app",
    summary:
      "Unify buttons, inputs, and cards in a small Figma library so engineers can ship faster—great for systems-minded designers.",
    duration: "2 weeks",
    skills: "UI systems, Figma",
    imageSrc:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=600&fit=crop&q=80",
    imageAlt: "Mobile phones displaying app interfaces",
    overview:
      "The app works but looks inconsistent. You consolidate variants, document states (default, pressed, error), and hand off a tidy file devs can inspect.",
    deliverables: [
      "Figma library with core components documented",
      "Short Loom-style written notes for engineers (optional)",
      "Light/dark or accessibility contrast pass on key screens",
    ],
    idealFor: "UI designers who want systems and handoff experience.",
  },
  {
    slug: "founder-pitch-deck",
    title: "Founder pitch deck polish",
    company: "Example: climate hardware seed round",
    summary:
      "Restructure a 12-slide deck for clarity: problem, traction, ask—fits presentation design and storytelling practice.",
    duration: "1–2 weeks",
    skills: "Storytelling, Keynote / Slides",
    imageSrc:
      "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=900&h=600&fit=crop&q=80",
    imageAlt: "Team reviewing presentation on screen",
    overview:
      "Founders have rough slides and data. You sharpen the narrative, improve visual hierarchy, and keep numbers honest while making the story investable.",
    deliverables: [
      "12-slide outline with speaker notes",
      "Polished deck file (brand-agnostic or template-based)",
      "One-page appendix with key metrics",
    ],
    idealFor: "Business, design, or comms students interested in startups.",
  },
  {
    slug: "customer-interview-synthesis",
    title: "Customer interview synthesis",
    company: "Example: HR tech pilot",
    summary:
      "Summarize ten recorded interviews into themes, quotes, and three recommendations—entry-level research ops work.",
    duration: "1 week",
    skills: "Research, Notion / Sheets",
    imageSrc:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&h=600&fit=crop&q=80",
    imageAlt: "Team collaboration and notes",
    overview:
      "The company ran pilot calls and has messy notes. You tag insights, surface pain vs delight, and suggest what to build next.",
    deliverables: [
      "Theme map with supporting quotes (anonymized)",
      "Top 5 findings + suggested product bets",
      "Raw tagging sheet for the team to reuse",
    ],
    idealFor: "Students in research, psychology, or PM-adjacent roles.",
  },
  {
    slug: "seo-blog-sprint",
    title: "SEO blog sprint",
    company: "Example: B2B analytics tool",
    summary:
      "Four long-form articles mapped to keywords and a reusable outline template—ideal for budding content strategists.",
    duration: "2 weeks",
    skills: "SEO, Copywriting",
    imageSrc:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=900&h=600&fit=crop&q=80",
    imageAlt: "Hands writing in a notebook next to laptop on a cafe table",
    overview:
      "The startup has a backlog of topics but inconsistent quality. You turn a keyword sheet into prioritized briefs, then draft polished posts with meta titles and internal link suggestions.",
    deliverables: [
      "Brief template the team can duplicate",
      "4 x 900–1100-word drafts with headings and slug ideas",
      "Light technical SEO checklist passed to whoever publishes",
    ],
    idealFor: "Marketing or journalism students experimenting with searchable content.",
  },
  {
    slug: "email-nurture-drip",
    title: "Email nurture sequence",
    company: "Example: consumer savings app",
    summary:
      "Five-email welcome + education flow with subject-line variants and CTA tests—great for lifecycle copy practice.",
    duration: "1–2 weeks",
    skills: "Lifecycle copy, Figma / Notion",
    imageSrc:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop&q=80",
    imageAlt: "Laptop on a desk with natural light, ready for focused writing and planning work",
    overview:
      "Product marketing has goals (activation, feature adoption) but no narrative arc. You map user moments, write copy in the brand voice, and annotate where experiments could run.",
    deliverables: [
      "User journey snippet with hypothesis per email",
      "5 emails with alternate subject lines",
      "Simple KPI table the growth team can track",
    ],
    idealFor: "Students interested in growth, CRM, or product marketing.",
  },
  {
    slug: "llm-help-center-pass",
    title: "Help center clarity pass",
    company: "Example: SMB payroll platform",
    summary:
      "Rewrite ten help articles for plain-language + AI-assisted support—technical writing meets responsible AI framing.",
    duration: "1–2 weeks",
    skills: "Tech writing, Notion",
    imageSrc:
      "https://images.unsplash.com/photo-1551434678-e076c223a692?w=900&h=600&fit=crop&q=80",
    imageAlt: "Developers collaborating at workstations with multiple monitors",
    overview:
      "Support tickets cluster around onboarding taxes. You audit existing KB pages, shorten steps, define glossary terms, and flag where automation should escalate to humans.",
    deliverables: [
      "Annotated outline of duplicated content to merge",
      "10 rewritten articles with FAQs",
      "Escalation matrix for bots vs humans",
    ],
    idealFor: "Comms or CS majors plus technically curious writers.",
  },
  {
    slug: "event-microsite-wireframe",
    title: "Event microsite wireframe",
    company: "Example: nonprofit climate summit",
    summary:
      "Low-fi wireframes for registration + agenda + sponsor strip—shows IA and prototyping without full visual design.",
    duration: "1 week",
    skills: "IA, Figma",
    imageSrc:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&h=600&fit=crop&q=80",
    imageAlt: "Conference audience seated in modern auditorium seating",
    overview:
      "Organizers need a single scroll experience that plugs into their ticketing vendor. You structure sections, annotate CTAs, and note accessibility checkpoints for captions and registrations.",
    deliverables: [
      "Sitemap plus mobile/desktop wireframes",
      "Component checklist (hero, speaker grid, FAQs)",
      "Accessibility notes referencing WCAG-friendly patterns",
    ],
    idealFor: "UX or aspiring web designers prototyping fast.",
  },
];

export function getSampleShowcaseBySlug(slug: string): SampleShowcaseProject | undefined {
  return SAMPLE_SHOWCASE_PROJECTS.find((p) => p.slug === slug);
}
