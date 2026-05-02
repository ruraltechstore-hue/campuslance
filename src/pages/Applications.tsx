import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

type Proposal = {
  id: string;
  project_id: string;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

type Project = {
  id: string;
  title: string;
  budget: number;
  business_id: string;
};

const Applications = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<(Proposal & { project?: Project })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: props } = await supabase
        .from("proposals")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false });
      const list = (props ?? []) as Proposal[];
      if (list.length) {
        const { data: projs } = await supabase
          .from("business_projects")
          .select("id, title, budget, business_id")
          .in(
            "id",
            list.map((p) => p.project_id)
          );
        const map = new Map<string, Project>();
        (projs ?? []).forEach((p) => map.set(p.id, p as Project));
        setItems(list.map((p) => ({ ...p, project: map.get(p.project_id) })));
      } else {
        setItems([]);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="container-page py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">My applications</h1>
        <p className="text-muted-foreground mb-8">Track the status of your proposals.</p>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            You haven't applied to any projects yet.
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex justify-between items-start gap-3 mb-2">
                  <Link
                    to={`/projects/${p.project_id}`}
                    className="font-display font-semibold hover:underline"
                  >
                    {p.project?.title || "Project"}
                  </Link>
                  <Badge
                    className="capitalize"
                    variant={
                      p.status === "accepted"
                        ? "default"
                        : p.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{p.message}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Timeline: {p.timeline}</span>
                  <span>Applied {format(new Date(p.created_at), "MMM d, yyyy")}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Applications;
