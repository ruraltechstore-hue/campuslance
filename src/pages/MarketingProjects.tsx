import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, ClipboardList, GraduationCap, Sparkles, Palette, FileText, LineChart } from "lucide-react";
import { SAMPLE_SHOWCASE_PROJECTS } from "@/content/sampleShowcaseProjects";

const HOW_STEPS = [
  {
    step: "1",
    title: "For students",
    body: "Complete your portfolio, apply to projects that fit your skills, and deliver milestones agreed with the business. Build proof of work you can take to every interview.",
    image: {
      src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80",
      alt: "Student working on a laptop with peers in the background",
    },
    icon: GraduationCap,
  },
  {
    step: "2",
    title: "For businesses",
    body: "Post a clear brief, review applicants and portfolios, and select the right student. You stay in control of scope, timeline, and approvals—without agency retainers.",
    image: {
      src: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=500&fit=crop&q=80",
      alt: "Two professionals reviewing work together at a tablet",
    },
    icon: Briefcase,
  },
  {
    step: "3",
    title: "End-to-end on the platform",
    body: "Applications, messaging, and deliverables stay organized in one place so both sides can focus on outcomes, not admin.",
    image: {
      src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop&q=80",
      alt: "Collaborative teamwork with notes and discussion at a bright office table",
    },
    icon: ClipboardList,
  },
] as const;

const PROJECT_TYPES = [
  {
    title: "Design & branding",
    blurb:
      "Visual identity tweaks, decks, landing pages—scoped creative work students can showcase in a case study.",
    src: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=380&fit=crop&q=80",
    alt: "Designer desk with sketches, tablet, and colour samples",
    icon: Palette,
  },
  {
    title: "Content & marketing",
    blurb:
      "Carousels, email sequences, scripts—bite-sized bundles that sharpen copy and campaign instincts.",
    src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=380&fit=crop&q=80",
    alt: "Team presenting slides on a monitor during a workshop",
    icon: FileText,
  },
  {
    title: "Research & product",
    blurb:
      "Heuristic audits, synthesis of interviews, light analytics—perfect for sharpening research and PM muscles.",
    src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=380&fit=crop&q=80",
    alt: "Laptop screen showing charts and data insights",
    icon: LineChart,
  },
] as const;

const MarketingProjects = () => {
  const { user } = useAuth();

  return (
    <Layout siteFooter>
      <section className="container-page pt-20 pb-12 max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground mb-6">
          <Sparkles className="h-3 w-3 text-accent" />
          For illustration only
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
          Projects on CampusLance
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This page describes how project-based collaborations work on the platform. When you sign up, you&apos;ll browse
          or post <strong className="text-foreground font-medium">real</strong> briefs—not the sample ideas below, which
          are here only to show the types of engagements students and businesses often run. Tap a card to read a full
          sample brief. Each example includes suggested deliverables so you can sanity-check scope before posting your own.
        </p>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page py-16">
          <h2 className="font-display text-2xl font-bold mb-4 text-center">How it works</h2>
          <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto mb-12 leading-relaxed">
            Three steps describe the full loop—from discovery to delivery—whether you are posting work or applying for it.
          </p>
          <div className="grid gap-12 lg:grid-cols-3 max-w-6xl mx-auto">
            {HOW_STEPS.map((s) => {
              const StepIcon = s.icon;
              return (
                <div key={s.step} className="flex flex-col">
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-border bg-muted mb-5">
                    <img src={s.image.src} alt={s.image.alt} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute top-3 left-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/90 border border-border text-sm font-bold font-display shadow-sm">
                      {s.step}
                    </span>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                      <StepIcon className="h-5 w-5 text-accent" aria-hidden />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 border-b border-border">
        <h2 className="font-display text-2xl font-bold mb-3">Types of projects you&apos;ll see</h2>
        <p className="text-muted-foreground text-sm max-w-2xl mb-10 leading-relaxed">
          Real listings span more than these buckets, but most briefs rhyme with design, storytelling, or structured
          thinking—ideal for coursework-adjacent schedules.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROJECT_TYPES.map((t) => {
            const TypeIcon = t.icon;
            return (
              <article
                key={t.title}
                className="rounded-xl border border-border bg-card overflow-hidden flex flex-col h-full hover:border-accent/30 transition-colors"
              >
                <div className="aspect-[16/10] bg-muted shrink-0">
                  <img src={t.src} alt={t.alt} className="w-full h-full object-cover" loading="lazy" />
                </div>
                <div className="p-5 flex gap-3 flex-1">
                  <TypeIcon className="h-5 w-5 text-accent shrink-0 mt-0.5" aria-hidden />
                  <div>
                    <h3 className="font-display font-semibold mb-2">{t.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.blurb}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-2xl font-bold mb-3">Sample project ideas</h2>
        <p className="text-muted-foreground text-sm max-w-2xl mb-10">
          The cards below are fictional examples to inspire scope and wording—they are not live listings. After you join,
          open the dashboard to see real opportunities.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SAMPLE_SHOWCASE_PROJECTS.map((p) => (
            <Link
              key={p.slug}
              to={`/projects/showcase/${p.slug}`}
              className="group block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <Card className="h-full overflow-hidden transition-colors group-hover:border-accent/40 group-hover:shadow-md">
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={p.imageSrc}
                    alt={p.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="font-display text-lg group-hover:text-accent transition-colors">
                    {p.title}
                  </CardTitle>
                  <CardDescription>{p.company}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 pt-0">
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{p.summary}</p>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-md bg-secondary px-2 py-1 text-secondary-foreground">{p.duration}</span>
                    <span className="rounded-md bg-accent-soft px-2 py-1 text-accent">{p.skills}</span>
                  </div>
                  <span className="text-sm font-medium text-accent">View sample brief →</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!user && (
          <div className="mt-14 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/signup?role=student">
                I&apos;m a student <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/signup?role=business">I&apos;m hiring</Link>
            </Button>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default MarketingProjects;
