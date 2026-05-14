import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import {
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowRight,
  FolderKanban,
  Trophy,
  Handshake,
  ShieldCheck,
  Layers,
} from "lucide-react";

const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=900&fit=crop&q=80",
  alt: "Students collaborating together with laptops at a campus table",
};

const VALUE_CHIPS = [
  { label: "Project-based work", icon: Layers },
  { label: "Verified businesses", icon: ShieldCheck },
  { label: "Student-first hiring", icon: GraduationCap },
  { label: "Portfolio-ready outcomes", icon: Trophy },
] as const;

const WHY_ROWS = [
  {
    title: "Real briefs, not busywork",
    body: "Companies post scoped projects—design passes, audits, content packs—with clear timelines. You contribute to outcomes they will actually ship or use.",
    image: {
      src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&h=560&fit=crop&q=80",
      alt: "Team members collaborating during a workshop with laptops open",
    },
    icon: FolderKanban,
  },
  {
    title: "Proof you can talk about",
    body: "Every engagement becomes a portfolio story: the problem, your approach, and what you delivered. Walk into interviews with work that echoes how modern teams collaborate.",
    image: {
      src: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&h=560&fit=crop&q=80",
      alt: "Person presenting ideas on a whiteboard during a productive meeting",
    },
    icon: Trophy,
  },
  {
    title: "Fair collaboration by design",
    body: "Scope and milestones stay visible to both sides. Businesses get fresh talent without massive retainers; students get credible experience with organizations that respect the process.",
    image: {
      src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&h=560&fit=crop&q=80",
      alt: "Two colleagues shaking hands after reaching a professional agreement",
    },
    icon: Handshake,
  },
] as const;

const Landing = () => {
  return (
    <Layout siteFooter>
      <section className="container-page pt-16 pb-20 lg:pt-20 lg:pb-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-14 lg:items-center">
          <div className="max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
              <Sparkles className="h-3 w-3 text-accent" />
              Built for the next generation of work
            </div>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
              Where students meet
              <br />
              <span className="text-accent">real businesses.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              CampusLance connects ambitious students with project-based work from companies that believe in talent over
              titles. Whether you are prototyping a brand touchpoint or shipping a research synthesis, you collaborate in
              defined milestones with visibility for both sides.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/signup?role=student">
                  I'm a student <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/signup?role=business">I'm hiring</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-2">
              {VALUE_CHIPS.map(({ label, icon: ChipIcon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  <ChipIcon className="h-3.5 w-3.5 text-accent shrink-0" aria-hidden />
                  {label}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-border bg-muted aspect-[4/3] lg:aspect-auto lg:min-h-[420px] max-h-[520px]">
            <img
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page py-20 space-y-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl sm:text-3xl font-bold mb-3">Why CampusLance</h2>
            <p className="text-muted-foreground leading-relaxed">
              We built the experience around outcomes you can show off—whether you&apos;re learning or hiring.
            </p>
          </div>

          <div className="space-y-16 md:space-y-24">
            {WHY_ROWS.map((row, i) => {
              const RowIcon = row.icon;
              return (
                <div
                  key={row.title}
                  className={`grid gap-8 md:grid-cols-2 md:gap-12 md:items-center ${i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""}`}
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden border border-border bg-muted">
                    <img
                      src={row.image.src}
                      alt={row.image.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
                      <RowIcon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-3">{row.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{row.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-12 pt-4 border-t border-border">
            <div>
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">For students</h2>
              <p className="text-muted-foreground leading-relaxed">
                Build your portfolio, apply to real briefs from real companies, and get paid for the work you&apos;d do
                anyway. Showcase outcomes—wireframes, decks, copy, research packs—that mirror how teams actually ship.
              </p>
            </div>
            <div>
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">For businesses</h2>
              <p className="text-muted-foreground leading-relaxed">
                Post a project, review portfolios, pick the right student. Fresh perspective without the agency markup—and
                clearer handoffs because scope lives next to the conversation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 md:py-20 border-t border-border">
        <h2 className="font-display text-2xl font-bold mb-3 text-center max-w-2xl mx-auto">
          What happens after you join
        </h2>
        <p className="text-muted-foreground text-center text-sm max-w-xl mx-auto mb-12 leading-relaxed">
          The flow stays lightweight so you spend energy on deliverables—not juggling five tools to find the latest brief.
        </p>
        <div className="grid md:grid-cols-3 gap-10 max-w-4xl mx-auto">
          {[
            {
              step: "01",
              title: "Explore or publish",
              body: "Students browse curated briefs; businesses draft a project with skills, deadlines, and budget guardrails.",
              to: "/projects",
              label: "See sample project types",
            },
            {
              step: "02",
              title: "Apply or shortlist",
              body: "Portfolios tell the story before the kickoff call. Businesses compare fit; students pick engagements that align with their term.",
              to: "/about",
              label: "Why we built this",
            },
            {
              step: "03",
              title: "Ship milestones",
              body: "Check off agreed checkpoints, gather feedback on-platform, and end with artifacts both sides can reference later.",
              to: "/signup",
              label: "Create your account",
            },
          ].map((item) => (
            <div key={item.step} className="text-center md:text-left">
              <p className="font-display text-sm font-bold text-accent mb-2">{item.step}</p>
              <h3 className="font-display font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.body}</p>
              <Link to={item.to} className="text-sm font-medium text-accent hover:underline">
                {item.label} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Landing;
