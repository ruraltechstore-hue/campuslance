import { Layout } from "@/components/Layout";
import { Link, Navigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { getSampleShowcaseBySlug } from "@/content/sampleShowcaseProjects";

const SampleProjectShowcase = () => {
  const { slug } = useParams<{ slug: string }>();
  const project = slug ? getSampleShowcaseBySlug(slug) : undefined;

  if (!slug || !project) {
    return <Navigate to="/projects" replace />;
  }

  return (
    <Layout siteFooter>
      <article className="container-page pt-20 pb-16 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-8 -ml-2 text-muted-foreground" asChild>
          <Link to="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to sample projects
          </Link>
        </Button>

        <div className="rounded-xl overflow-hidden border border-border bg-card shadow-sm mb-8">
          <img
            src={project.imageSrc}
            alt={project.imageAlt}
            className="w-full h-56 sm:h-72 object-cover"
            loading="lazy"
          />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-accent mb-2">Sample showcase only</p>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">{project.title}</h1>
        <p className="text-muted-foreground mb-6">{project.company}</p>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground">{project.duration}</span>
          <span className="rounded-md bg-accent-soft px-2 py-1 text-xs text-accent">{project.skills}</span>
        </div>

        <div className="space-y-8 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Overview</h2>
            <p>{project.overview}</p>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">What you would deliver</h2>
            <ul className="list-disc pl-5 space-y-2">
              {project.deliverables.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">Ideal for</h2>
            <p>{project.idealFor}</p>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default SampleProjectShowcase;
