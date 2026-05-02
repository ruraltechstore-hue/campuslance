import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Item = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  image_url: string | null;
  skills: string[];
  category: string | null;
};

type Profile = { id: string; name: string | null };

const StudentBrowse = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("student_projects")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(60);
      setItems((data ?? []) as Item[]);
      const ids = [...new Set((data ?? []).map((i) => i.student_id))];
      if (ids.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name")
          .in("id", ids);
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (map[p.id] = p as Profile));
        setProfiles(map);
      }
      setLoading(false);
    })();
  }, []);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      !q ||
      i.title.toLowerCase().includes(q) ||
      i.description.toLowerCase().includes(q) ||
      i.skills?.some((s) => s.toLowerCase().includes(q)) ||
      i.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Layout>
      <div className="container-page py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Browse student talent</h1>
          <p className="text-muted-foreground">Discover work from students across the network.</p>
        </div>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by skill or category…"
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : filtered.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No portfolio items yet.</Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((it) => (
              <Link key={it.id} to={`/students/${it.student_id}`}>
                <Card className="overflow-hidden h-full group hover:border-foreground/30 transition-colors">
                  {it.image_url && (
                    <div className="aspect-video bg-muted overflow-hidden">
                      <img
                        src={it.image_url}
                        alt={it.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-sm leading-tight">
                      {it.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      by {profiles[it.student_id]?.name || "Student"}
                    </p>
                    {it.skills?.length ? (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {it.skills.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
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

export default StudentBrowse;
