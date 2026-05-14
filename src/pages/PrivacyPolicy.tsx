import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <Layout siteFooter>
      <article className="container-page pt-20 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Privacy policy</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">1. Introduction</h2>
            <p>
              CampusLance (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) operates the CampusLance website and related
              services. This policy describes how we handle personal information when you use our services. It is
              intended as general information and should be reviewed by qualified counsel for your jurisdiction.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">2. Information we collect</h2>
            <p>We may collect information you provide directly, such as:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account details (e.g. name, email, role as student or business)</li>
              <li>Profile and portfolio content you choose to upload</li>
              <li>Communications you send to us via support or contact channels</li>
            </ul>
            <p>We may also collect technical data such as device type, browser, and approximate location derived from IP address.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">3. How we use information</h2>
            <p>We use information to operate and improve the platform, authenticate users, match students with projects, send service-related messages, enforce our terms, and comply with law.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">4. Sharing</h2>
            <p>
              We may share information with service providers who assist our operations (e.g. hosting, authentication)
              under appropriate agreements. We may disclose information if required by law or to protect rights and
              safety.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">5. Retention</h2>
            <p>We retain information for as long as needed to provide the service and for legitimate business or legal purposes, unless a shorter period is required by law.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">6. Your choices</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or export certain personal
              data, or to object to or restrict some processing. Contact us to exercise these rights where applicable.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">7. Security</h2>
            <p>We implement reasonable measures to protect information, but no method of transmission over the Internet is completely secure.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">8. Contact</h2>
            <p>
              Questions about this policy:{" "}
              <a href="mailto:support@campuslance.com" className="text-accent hover:underline">
                support@campuslance.com
              </a>
              . See also our{" "}
              <Link to="/cookies" className="text-accent hover:underline">
                Cookie policy
              </Link>
              .
            </p>
          </section>
        </div>
      </article>
    </Layout>
  );
};

export default PrivacyPolicy;
