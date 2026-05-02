import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Search, DollarSign, Calendar } from "lucide-react";
import { format } from "date-fns";

type Project = {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  budget: number;
  deadline: string | null;
  category: string | null;
  status: string;
  business_id: string;
  created_at: string;
};

type Profile = { id: string; company_name: string | null; industry: string | null };

const StudentDashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("business_projects")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
      setProjects(data ?? []);
      const ids = [...new Set((data ?? []).map((p) => p.business_id))];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, company_name, industry")
          .in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[p.id] = p));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.required_skills?.some((s) => s.toLowerCase().includes(q)) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Browse projects</h1>
          <p className="text-muted-foreground">Find work that matches your skills.</p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill, category, keyword…"
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No open projects yet. Check back soon.</p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filtered.map((p) => (
              <Link key={p.id} to={`/projects/${p.id}`}>
                <Card className="p-6 hover:border-foreground/30 transition-colors">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                      <h3 className="font-display font-semibold text-lg leading-snug">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {profiles[p.business_id]?.company_name || "Business"}
                        {p.category && ` · ${p.category}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-accent font-semibold whitespace-nowrap">
                      <DollarSign className="h-4 w-4" />
                      {Number(p.budget).toLocaleString()}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex flex-wrap items-center gap-2">
                    {p.required_skills?.slice(0, 5).map((s) => (
                      <Badge key={s} variant="secondary" className="font-normal">
                        {s}
                      </Badge>
                    ))}
                    {p.deadline && (
                      <span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        Due {format(new Date(p.deadline), "MMM d")}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
