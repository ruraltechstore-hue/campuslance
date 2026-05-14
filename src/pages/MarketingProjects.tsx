import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Briefcase, ClipboardList, GraduationCap, Sparkles } from "lucide-react";
import { SAMPLE_SHOWCASE_PROJECTS } from "@/content/sampleShowcaseProjects";

const MarketingProjects = () => {
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
          This page describes how project-based collaborations work on the platform. When you sign up, you&apos;ll
          browse or post <strong className="text-foreground font-medium">real</strong> briefs—not the sample ideas
          below, which are here only to show the types of engagements students and businesses often run. Tap a card to
          read a full sample brief.
        </p>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page py-16">
          <h2 className="font-display text-2xl font-bold mb-10 text-center">How it works</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <GraduationCap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">For students</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete your portfolio, apply to projects that fit your skills, and deliver milestones agreed with
                  the business. Build proof of work you can take to every interview.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">For businesses</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Post a clear brief, review applicants and portfolios, and select the right student. You stay in
                  control of scope, timeline, and approvals—without agency retainers.
                </p>
              </div>
            </div>
            <div className="flex gap-4 md:col-span-2 max-w-xl mx-auto w-full">
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-display font-semibold mb-2">End-to-end on the platform</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Applications, messaging, and deliverables stay organized in one place so both sides can focus on
                  outcomes, not admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="font-display text-2xl font-bold mb-3">Sample project ideas</h2>
        <p className="text-muted-foreground text-sm max-w-2xl mb-10">
          The cards below are fictional examples to inspire scope and wording—they are not live listings. After you
          join, open the dashboard to see real opportunities.
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
      </section>
    </Layout>
  );
};

export default MarketingProjects;
