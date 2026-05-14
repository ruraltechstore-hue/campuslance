import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Target, Users, Compass, Zap, Lightbulb, CheckCircle2 } from "lucide-react";

const STORY_IMAGE =
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&h=700&fit=crop&q=80";
const STORY_ALT =
  "Bright modern office lounge with workstations where people collaborate remotely and in person";

const VALUE_THUMBNAILS = [
  {
    title: "Clarity first",
    text: "Briefs outline scope and expectations up front—fewer surprises, faster alignment.",
    src: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=260&fit=crop&q=80",
    alt: "Open notebook with planning notes beside a laptop on a wooden desk",
  },
  {
    title: "Respect timelines",
    text: "Deadlines mirror how students balance coursework—we never assume infinite availability.",
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=260&fit=crop&q=80",
    alt: "Calendar and schedule planning on desk with pens",
  },
  {
    title: "Trust by verification",
    text: "Businesses can verify so students know postings come from credible organizations.",
    src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=260&fit=crop&q=80",
    alt: "Colleagues reviewing documents together on a tablet",
  },
] as const;

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1400&h=600&fit=crop&q=80";
const HERO_ALT = "Students collaborating around laptops on campus";

const PILLAR_IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=500&fit=crop&q=80",
    alt: "Team planning together at a table with notebooks",
  },
  {
    src: "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=500&fit=crop&q=80",
    alt: "Professionals in discussion in a bright office",
  },
  {
    src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=500&fit=crop&q=80",
    alt: "Hands shaking in a professional agreement",
  },
] as const;

const About = () => {
  return (
    <Layout siteFooter>
      <section className="container-page pt-20 pb-10">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">About CampusLance</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-3xl">
          We built CampusLance so students can prove their skills on real briefs—and so businesses can hire
          ambition, not just résumé lines. Talent should win over titles.
        </p>
        <div className="rounded-xl overflow-hidden border border-border bg-muted max-h-[280px] aspect-[21/9] max-w-5xl">
          <img src={HERO_IMAGE} alt={HERO_ALT} className="w-full h-full object-cover" loading="lazy" />
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page py-16 grid md:grid-cols-3 gap-10">
          <div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border mb-4 bg-muted">
              <img
                src={PILLAR_IMAGES[0].src}
                alt={PILLAR_IMAGES[0].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Our mission</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Connect capable students with companies that need project-based help—fairly, transparently, and
              with outcomes both sides can show off.
            </p>
          </div>
          <div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border mb-4 bg-muted">
              <img
                src={PILLAR_IMAGES[1].src}
                alt={PILLAR_IMAGES[1].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Who we serve</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Students who want portfolio-worthy work and paid experience, and businesses that want fresh ideas
              without traditional agency overhead.
            </p>
          </div>
          <div>
            <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border mb-4 bg-muted">
              <img
                src={PILLAR_IMAGES[2].src}
                alt={PILLAR_IMAGES[2].alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-xl font-bold mb-2">Trust &amp; verification</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We take onboarding seriously: businesses can complete verification so students know they are
              engaging with legitimate opportunities.
            </p>
          </div>
        </div>
      </section>

      <section className="container-page py-20 border-y border-border">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 lg:items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wide mb-3">
              <Compass className="h-4 w-4" aria-hidden />
              Our story
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-6">Campus internships needed a rethink</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Traditional internships do not scale for every student—or every startup. CampusLance started from a simple
                idea: packaged projects could give learners real outcomes without six-month rotations, while companies
                could access sharp talent without full-time commitments.
              </p>
              <p>
                Today we focus on quality matches: portfolios that showcase ability, verification that earns trust, and
                workflows that keep both sides accountable. The goal is mutual proof—students ship work they are proud of,
                and businesses see results they can iterate on.
              </p>
              <p>
                We are intentionally opinionated: projects should be bounded, documented, and respectful of academic
                calendars. That keeps expectations grounded and raises the odds that both sides finish strong—and come
                back for the next brief.
              </p>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-[16/11] lg:aspect-auto lg:min-h-[320px]">
            <img src={STORY_IMAGE} alt={STORY_ALT} className="w-full h-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      <section className="bg-card border-b border-border">
        <div className="container-page py-16">
          <div className="max-w-2xl mb-12">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wide mb-3">
              <Zap className="h-4 w-4" aria-hidden />
              How we work
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Values that guide every match</h2>
            <p className="text-muted-foreground leading-relaxed">
              These principles shape product decisions, onboarding, and how we think about fairness on both sides of a
              project.
            </p>
          </div>
          <ul className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {VALUE_THUMBNAILS.map((v) => (
              <li key={v.title} className="flex flex-col gap-4">
                <div className="aspect-[16/10] rounded-lg overflow-hidden border border-border bg-muted">
                  <img src={v.src} alt={v.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="flex gap-3">
                  <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <h3 className="font-display font-semibold mb-1">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-14 pt-12 border-t border-border grid gap-4 sm:grid-cols-2 max-w-3xl mx-auto">
            {[
              "Transparent briefs help applicants self-select—the right student raises their hand.",
              "Milestones break big asks into doable wins for coursework-heavy schedules.",
              "Verification protects students from dubious listings and businesses from ambiguity.",
              "Portfolios compound: every shipped project strengthens the next conversation.",
            ].map((sentence) => (
              <div key={sentence} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-accent shrink-0" aria-hidden />
                <span>{sentence}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16 border-t border-border">
        <h2 className="font-display text-2xl sm:text-3xl font-bold mb-8">Questions we hear often</h2>
        <dl className="grid gap-8 sm:grid-cols-2 max-w-4xl">
          <div className="space-y-2">
            <dt className="font-display font-semibold text-foreground">Is CampusLance only for technical roles?</dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              Not at all—briefs include design systems, storytelling, operations research, and more. If you can package it
              as a scoped engagement with milestones, it probably belongs here.
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="font-display font-semibold text-foreground">How do businesses build trust with students?</dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              Organizations can complete verification, write plain-language briefs, and keep communication on-platform so
              expectations stay visible from day one.
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="font-display font-semibold text-foreground">Can students balance coursework and projects?</dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              Most listings are sized for part-time effort. You choose what fits your term—read timelines carefully before
              applying.
            </dd>
          </div>
          <div className="space-y-2">
            <dt className="font-display font-semibold text-foreground">Where do I go to see real opportunities?</dt>
            <dd className="text-sm text-muted-foreground leading-relaxed">
              Create an account, confirm your email, and open your role-specific dashboard. Marketing sample ideas on the
              Projects page are illustrations only.
            </dd>
          </div>
        </dl>
      </section>

      <section className="container-page py-16">
        <div className="max-w-xl mx-auto text-center">
          <p className="text-muted-foreground mb-6">Ready to get started?</p>
          <Button asChild size="lg">
            <Link to="/signup">
              Join CampusLance <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default About;
