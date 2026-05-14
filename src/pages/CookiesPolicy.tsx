import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const CookiesPolicy = () => {
  return (
    <Layout siteFooter>
      <article className="container-page pt-20 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          CampusLance cookie policy
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated:{" "}
          {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Who we are</h2>
            <p>
              CampusLance (&quot;CampusLance&quot;, &quot;we&quot;, &quot;us&quot;) operates the CampusLance web
              application—a platform where students can discover project-based work and businesses can post briefs,
              review applicants, and manage collaborations. Our team is based in Hyderabad, India. This policy describes
              how we use cookies and similar technologies on our websites and app frontends that link to this policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">What are cookies?</h2>
            <p>
              Cookies are small text files stored on your browser when you visit a site. Similar technologies include
              local storage and session storage keys in your browser. Together, they help a site remember your session,
              preferences, and (where allowed) how the product is used so we can improve CampusLance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">How CampusLance uses cookies</h2>
            <p>We group our use into these categories:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong className="text-foreground font-medium">Strictly necessary (authentication &amp; security).</strong>{" "}
                When you create an account or log in, our authentication provider (Supabase Auth) sets cookies and uses
                browser storage to keep your session secure, refresh tokens safely, and protect against common abuse.
                Without these, you cannot stay signed in to CampusLance or access protected areas such as your
                dashboard, applications, or project workspaces.
              </li>
              <li>
                <strong className="text-foreground font-medium">Functional (your experience).</strong> We may store
                lightweight preferences—for example whether you use our light or dark theme where that feature is
                enabled—so the interface stays consistent when you return.
              </li>
              <li>
                <strong className="text-foreground font-medium">Performance &amp; product analytics (if enabled).</strong>{" "}
                We may use first-party or third-party tools to understand aggregate usage (for example which screens are
                visited or where errors occur) so we can improve reliability and onboarding. If we enable such tools,
                we will aim to configure them to minimise personal data and to respect your choices where the law
                requires opt-in consent.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Cookies and your CampusLance account</h2>
            <p>
              Features that depend on knowing who you are—such as posting a project as a verified business, submitting an
              application as a student, or an administrator reviewing verifications—rely on authentication cookies and
              related tokens issued when you sign in. Logging out or clearing site data for CampusLance will remove or
              invalidate those session identifiers; you may need to sign in again.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Third parties</h2>
            <p>
              We use infrastructure and service providers to run CampusLance (including hosting and authentication).
              Those providers may set or read cookies or equivalent identifiers strictly as required to deliver the
              service—for example to route your requests securely to our application. Their use is governed by their own
              policies and our agreements with them.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">How long cookies last</h2>
            <p>
              Session cookies last until you close your browser (or until the session expires according to our
              authentication settings). Persistent cookies or stored preferences may last longer so you do not have to
              repeat choices each visit; retention periods depend on the specific cookie or key and will be kept only as
              long as needed for that purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Your choices</h2>
            <p>
              You can control cookies through your browser settings (block, delete, or alert before storing). Blocking
              all cookies may prevent you from logging in or using parts of CampusLance. Where applicable law requires
              consent for non-essential cookies, we will provide a way to adjust your preferences on the site.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Updates</h2>
            <p>
              We may update this cookie policy when we change how we use cookies (for example if we add new analytics or
              change auth providers). The &quot;Last updated&quot; date at the top will change, and we will post the new
              version here. Continued use of CampusLance after changes means you acknowledge the updated policy where
              permitted by law.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">Contact</h2>
            <p>
              Questions about this policy or our use of cookies:{" "}
              <a href="mailto:support@campuslance.com" className="text-accent hover:underline">
                support@campuslance.com
              </a>
              . For broader privacy topics, see our{" "}
              <Link to="/privacy-policy" className="text-accent hover:underline">
                Privacy policy
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default CookiesPolicy;
