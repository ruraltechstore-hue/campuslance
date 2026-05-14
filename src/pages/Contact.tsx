import { Layout } from "@/components/Layout";
import { Mail, MapPin, Phone } from "lucide-react";

const SUPPORT_EMAIL = "support@campuslance.com";
const PHONE_DISPLAY = "+91 93901 68733";
const PHONE_TEL = "+919390168733";
const ADDRESS =
  "Sai Silicon Heights, Ayyappa Society, Mega Hills, Madhapur, Hyderabad, Telangana 500081, India";

const Contact = () => {
  return (
    <Layout siteFooter>
      <section className="container-page pt-20 pb-16">
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Contact us</h1>
        <p className="text-lg text-muted-foreground max-w-xl leading-relaxed mb-12">
          Reach the CampusLance team for support, partnerships, or press using the details below. We aim to respond
          within a few business days.
        </p>

        <ul className="space-y-6 max-w-xl">
          <li className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground mb-1">Email</p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {SUPPORT_EMAIL}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground mb-1">Phone</p>
              <a
                href={`tel:${PHONE_TEL}`}
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </li>
          <li className="flex gap-4">
            <div className="h-10 w-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-medium text-sm text-foreground mb-1">Address</p>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">{ADDRESS}</p>
            </div>
          </li>
        </ul>
      </section>
    </Layout>
  );
};

export default Contact;
