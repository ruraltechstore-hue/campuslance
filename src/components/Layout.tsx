import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SiteFooter } from "@/components/SiteFooter";
import { AppSidebar } from "@/components/AppSidebar";
import { Menu } from "lucide-react";
import { ReactNode, useState } from "react";

const publicNavClass = ({ isActive }: { isActive: boolean }) =>
  `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
    isActive ? "text-foreground bg-secondary" : "text-muted-foreground hover:text-foreground"
  }`;

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About us" },
  { to: "/projects", label: "Projects" },
  { to: "/contact", label: "Contact" },
] as const;

export function Layout({
  children,
  siteFooter,
}: {
  children: ReactNode;
  siteFooter?: boolean;
}) {
  const { user, role, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const showSiteFooter = siteFooter ?? Boolean(user && (role === "student" || role === "business"));
  const showMarketingInAppShell = Boolean(user && (role === "student" || role === "business"));
  const useAppSidebar = Boolean(user && (role === "student" || role === "business"));
  /** Guests + student/business (app + website sections) + admin (admin links only) */
  const showMobileMenu = !user || showMarketingInAppShell || role === "admin";

  const navLinks =
    role === "admin"
      ? [
          { to: "/dashboard", label: "Overview" },
          { to: "/admin/verifications", label: "Verifications" },
        ]
      : role === "student"
        ? [
            { to: "/dashboard", label: "Browse projects" },
            { to: "/applications", label: "Applications" },
            { to: "/invites", label: "Invites" },
            { to: "/completed-work", label: "Completed work" },
            { to: "/portfolio", label: "Portfolio" },
          ]
        : role === "business"
          ? [
              { to: "/dashboard", label: "My projects" },
              { to: "/business/verification", label: "Verification" },
              { to: "/students", label: "Browse talent" },
              { to: "/worked-students", label: "Worked with" },
              { to: "/projects/new", label: "Post project" },
            ]
          : [];

  const brandMark = (
    <>
      <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
        <span className="text-primary-foreground font-bold text-sm">C</span>
      </div>
      <span className="font-display font-bold text-lg tracking-tight">CampusLance</span>
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          {user ? (
            <div
              className="flex items-center gap-2 shrink-0 cursor-default"
              aria-label="CampusLance"
            >
              {brandMark}
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 shrink-0">
              {brandMark}
            </Link>
          )}

          {user && role === "admin" ? (
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Admin navigation">
              {navLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={publicNavClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <nav
              className="hidden md:flex items-center gap-1 flex-1 justify-center"
              aria-label="Website navigation"
            >
              {publicLinks.map((l) => (
                <NavLink key={l.to} to={l.to} className={publicNavClass} end={l.to === "/"}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          )}

          {showMobileMenu && (
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100%,20rem)]">
                <nav className="flex flex-col gap-1 mt-8">
                  {user && role === "admin" && (
                    <>
                      <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Admin</p>
                      {navLinks.map((l) => (
                        <NavLink
                          key={l.to}
                          to={l.to}
                          className={publicNavClass}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </NavLink>
                      ))}
                    </>
                  )}
                  {user && showMarketingInAppShell && (
                    <>
                      <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">App</p>
                      {navLinks.map((l) => (
                        <NavLink
                          key={l.to}
                          to={l.to}
                          className={publicNavClass}
                          onClick={() => setMobileOpen(false)}
                        >
                          {l.label}
                        </NavLink>
                      ))}
                      <p className="px-3 pt-4 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Website
                      </p>
                    </>
                  )}
                  {(!user || showMarketingInAppShell) &&
                    publicLinks.map((l) => (
                      <NavLink
                        key={l.to}
                        to={l.to}
                        end={l.to === "/"}
                        className={publicNavClass}
                        onClick={() => setMobileOpen(false)}
                      >
                        {l.label}
                      </NavLink>
                    ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          <div className="flex items-center gap-2 shrink-0 min-h-9">
            {authLoading ? (
              <div className="flex gap-2" aria-hidden>
                <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
                <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
              </div>
            ) : user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await signOut();
                    navigate("/");
                  }}
                >
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate("/signup")}>
                  Get started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col min-h-0">
        <div className="flex flex-1 min-w-0 min-h-0">
          {useAppSidebar ? <AppSidebar links={navLinks} /> : null}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
        {showSiteFooter ? <SiteFooter /> : null}
      </div>
    </div>
  );
}
