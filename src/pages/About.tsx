import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Target, Users } from "lucide-react";

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
