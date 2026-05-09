import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Users2 } from "lucide-react";

type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: string;
  created_at: string;
};

const BusinessDashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [kycApproved, setKycApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: v } = await supabase
        .from("business_verifications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      setKycApproved(v?.status === "approved");
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("business_projects")
        .select("*")
        .eq("business_id", user.id)
        .order("created_at", { ascending: false });
      setProjects(data ?? []);
      if (data?.length) {
        const { data: props } = await supabase
          .from("proposals")
          .select("project_id")
          .in(
            "project_id",
            data.map((p) => p.id)
          );
        const c: Record<string, number> = {};
        (props ?? []).forEach((p) => (c[p.project_id] = (c[p.project_id] || 0) + 1));
        setCounts(c);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="container-page py-10">
        {kycApproved === false && (
          <Card className="mb-6 border-amber-500/40 bg-amber-500/5 p-4">
            <p className="font-medium text-sm mb-1">Business verification required</p>
            <p className="text-sm text-muted-foreground mb-3">
              Complete verification so you can post projects. Your existing account stays active.
            </p>
            <Button size="sm" asChild>
              <Link to="/business/verification">Start verification</Link>
            </Button>
          </Card>
        )}
        {kycApproved === null && (
          <p className="text-muted-foreground text-sm mb-6">Checking verification status…</p>
        )}
        <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">My projects</h1>
            <p className="text-muted-foreground">Manage your posts and review applicants.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/worked-students">
                <Users2 className="h-4 w-4 mr-1" /> Worked students
              </Link>
            </Button>
            {kycApproved === true ? (
              <Button asChild>
                <Link to="/projects/new">
                  <Plus className="h-4 w-4 mr-1" /> New project
                </Link>
              </Button>
            ) : kycApproved === false ? (
              <Button variant="outline" asChild>
                <Link to="/business/verification">
                  <Plus className="h-4 w-4 mr-1" /> Verify to post
                </Link>
              </Button>
            ) : (
              <Button disabled>
                <Plus className="h-4 w-4 mr-1" /> New project
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet.</p>
            {kycApproved === true ? (
              <Button asChild>
                <Link to="/projects/new">Post your first project</Link>
              </Button>
            ) : (
              <Button asChild variant="secondary">
                <Link to="/business/verification">Verify to post projects</Link>
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {projects.map((p) => (
              <Card key={p.id} className="p-6">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <div className="flex-1">
                    <Link to={`/projects/${p.id}`} className="hover:underline">
                      <h3 className="font-display font-semibold text-lg">{p.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {p.description}
                    </p>
                  </div>
                  <Badge
                    variant={p.status === "open" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {p.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <span className="text-sm font-semibold text-accent">
                    ${Number(p.budget).toLocaleString()}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/projects/${p.id}`}>
                      <Users className="h-3.5 w-3.5 mr-1" />
                      {counts[p.id] || 0} proposal{counts[p.id] === 1 ? "" : "s"}
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BusinessDashboard;
