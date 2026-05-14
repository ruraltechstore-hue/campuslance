import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";

const exploreLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

const legalLinks = [
  { to: "/legal", label: "Legal" },
  { to: "/privacy-policy", label: "Privacy policy" },
  { to: "/terms", label: "Terms and conditions" },
  { to: "/cookies", label: "Cookies" },
] as const;

const SUPPORT_EMAIL = "support@campuslance.com";
const PHONE_DISPLAY = "+91 93901 68733";
const PHONE_TEL = "+919390168733";
const ADDRESS =
  "Sai Silicon Heights, Ayyappa Society, Mega Hills, Madhapur, Hyderabad, Telangana 500081, India";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container-page py-12 md:py-14">
        <div className="grid gap-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">C</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight">CampusLance</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Connecting students with project-based work from businesses that value talent over titles.
            </p>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Explore</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {exploreLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Legal</h3>
            <ul className="flex flex-col gap-2 text-sm">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="font-display font-semibold text-sm text-foreground mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-foreground transition-colors">
                  {SUPPORT_EMAIL}
                </a>
              </li>
              <li className="flex gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <a href={`tel:${PHONE_TEL}`} className="hover:text-foreground transition-colors">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                <span className="leading-relaxed">{ADDRESS}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CampusLance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
