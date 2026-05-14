import { NavLink } from "react-router-dom";

export type AppSidebarLink = { to: string; label: string };

const sidebarLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
  }`;

export function AppSidebar({ links }: { links: AppSidebarLink[] }) {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-muted/25 md:block">
      <nav
        className="sticky top-16 flex max-h-[calc(100vh-4rem)] flex-col gap-0.5 overflow-y-auto p-3 py-5"
        aria-label="App navigation"
      >
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={sidebarLinkClass}
            end={l.to === "/dashboard"}
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
