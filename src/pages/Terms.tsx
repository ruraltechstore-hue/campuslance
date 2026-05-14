import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <Layout siteFooter>
      <article className="container-page pt-20 pb-16 max-w-3xl">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Terms and conditions
        </h1>
        <p className="text-sm text-muted-foreground mb-10">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-muted-foreground leading-relaxed text-sm">
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">1. Agreement</h2>
            <p>
              By accessing or using CampusLance, you agree to these terms. If you do not agree, do not use the
              service. These terms are provided as general-purpose boilerplate; you should have them reviewed by legal
              counsel for your business and jurisdiction.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">2. The service</h2>
            <p>
              CampusLance provides an online platform to help connect students with businesses for project-based work.
              We are not a party to agreements between students and businesses unless expressly stated elsewhere.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">3. Accounts</h2>
            <p>
              You must provide accurate information and keep credentials secure. You are responsible for activity under
              your account. We may suspend or terminate accounts that violate these terms or harm the platform.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">4. Acceptable use</h2>
            <p>You agree not to misuse the service, including by attempting unauthorized access, scraping in violation of our rules, harassment, fraud, or uploading malicious content.</p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">5. Content</h2>
            <p>
              You retain rights to content you submit. You grant us a license to host, display, and process your
              content as needed to operate CampusLance. You represent that you have the rights to grant this license.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">6. Disclaimers</h2>
            <p>
              The service is provided &quot;as is&quot;. We disclaim warranties to the fullest extent permitted by law.
              We do not guarantee any particular outcome from collaborations arranged through the platform.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">7. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, CampusLance and its affiliates will not be liable for indirect,
              incidental, special, consequential, or punitive damages, or for loss of profits or data.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">8. Changes</h2>
            <p>
              We may modify these terms. We will post updated terms on the site where appropriate. Continued use after
              changes constitutes acceptance of the revised terms.
            </p>
          </section>
          <section className="space-y-3">
            <h2 className="font-display text-lg font-semibold text-foreground">9. Contact</h2>
            <p>
              For questions about these terms:{" "}
              <a href="mailto:support@campuslance.com" className="text-accent hover:underline">
                support@campuslance.com
              </a>
              . Related:{" "}
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

export default Terms;
