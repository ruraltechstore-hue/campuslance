import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import { FileText, Cookie, Scale } from "lucide-react";

const Legal = () => {
  return (
    <Layout siteFooter>
      <section className="container-page pt-20 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">Legal</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12">
          Policies and terms for using CampusLance. Read the documents that apply to you; they may change as we
          grow—check back periodically.
        </p>

        <ul className="space-y-4">
          <li>
            <Link
              to="/privacy-policy"
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="font-display font-semibold text-foreground group-hover:underline">
                  Privacy policy
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  How we collect, use, and protect personal information.
                </p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/terms"
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <Scale className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="font-display font-semibold text-foreground group-hover:underline">
                  Terms and conditions
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Rules and responsibilities for using our services.
                </p>
              </div>
            </Link>
          </li>
          <li>
            <Link
              to="/cookies"
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
                <Cookie className="h-5 w-5 text-accent" />
              </div>
              <div>
                <span className="font-display font-semibold text-foreground group-hover:underline">Cookie policy</span>
                <p className="text-sm text-muted-foreground mt-1">
                  How we use cookies and similar technologies on the site.
                </p>
              </div>
            </Link>
          </li>
        </ul>
      </section>
    </Layout>
  );
};

export default Legal;
