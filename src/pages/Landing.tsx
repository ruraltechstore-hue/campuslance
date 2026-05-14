import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { Briefcase, GraduationCap, Sparkles, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <Layout siteFooter>
      <section className="container-page pt-20 pb-24">
        <div className="max-w-3xl">
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
            CampusLance connects ambitious students with project-based work from
            companies that believe in talent over titles.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button asChild size="lg" className="h-12 px-6">
              <Link to="/signup?role=student">
                I'm a student <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6">
              <Link to="/signup?role=business">I'm hiring</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="container-page py-20 grid md:grid-cols-2 gap-12">
          <div>
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <GraduationCap className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">For students</h2>
            <p className="text-muted-foreground leading-relaxed">
              Build your portfolio, apply to real briefs from real companies,
              and get paid for the work you'd do anyway.
            </p>
          </div>
          <div>
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Briefcase className="h-5 w-5 text-accent" />
            </div>
            <h2 className="font-display text-2xl font-bold mb-3">For businesses</h2>
            <p className="text-muted-foreground leading-relaxed">
              Post a project, review portfolios, pick the right student.
              Fresh perspective without the agency markup.
            </p>
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default Landing;
