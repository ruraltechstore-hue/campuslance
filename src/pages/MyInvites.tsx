import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { DollarSign } from "lucide-react";

type Invite = {
  id: string;
  project_id: string;
  business_id: string;
  status: "pending" | "accepted" | "rejected";
  message: string;
  created_at: string;
};

type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  business_id: string;
};

type Profile = { id: string; company_name: string | null; name: string | null };

const MyInvites = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [projects, setProjects] = useState<Record<string, Project>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: inv } = await (supabase as any)
      .from("invites")
      .select("*")
      .eq("student_id", user.id)
      .order("created_at", { ascending: false });
    const list = (inv ?? []) as Invite[];
    setInvites(list);

    if (list.length) {
      const projIds = [...new Set(list.map((i) => i.project_id))];
      const bizIds = [...new Set(list.map((i) => i.business_id))];

      const { data: projs } = await supabase
        .from("business_projects")
        .select("id, title, description, budget, business_id")
        .in("id", projIds);
      const pMap: Record<string, Project> = {};
      (projs ?? []).forEach((p) => (pMap[p.id] = p as Project));
      setProjects(pMap);

      const { data: profs } = await supabase
        .from("profiles")
        .select("id, company_name, name")
        .in("id", bizIds);
      const bMap: Record<string, Profile> = {};
      (profs ?? []).forEach((p) => (bMap[p.id] = p as Profile));
      setProfiles(bMap);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function respond(id: string, status: "accepted" | "rejected") {
    const { error } = await (supabase as any)
      .from("invites")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      status === "accepted"
        ? "Invite accepted — project assigned to you."
        : "Invite rejected."
    );
    load();
  }

  return (
    <Layout>
      <div className="container-page py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Project invites</h1>
        <p className="text-muted-foreground mb-8">
          Direct invites from businesses who want to work with you.
        </p>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : invites.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No invites yet. Build out your portfolio so businesses can find you!
          </Card>
        ) : (
          <div className="space-y-3">
            {invites.map((i) => {
              const proj = projects[i.project_id];
              const biz = profiles[i.business_id];
              return (
                <Card key={i.id} className="p-6">
                  <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                    <div>
                      {proj ? (
                        <Link
                          to={`/projects/${i.project_id}`}
                          className="font-display font-semibold text-lg hover:underline"
                        >
                          {proj.title}
                        </Link>
                      ) : (
                        <span className="font-display font-semibold text-lg">Project</span>
                      )}
                      <p className="text-sm text-muted-foreground mt-0.5">
                        From {biz?.company_name || biz?.name || "Business"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge
                        className="capitalize"
                        variant={
                          i.status === "accepted"
                            ? "default"
                            : i.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {i.status}
                      </Badge>
                      {proj && (
                        <span className="text-sm font-semibold text-accent inline-flex items-center">
                          <DollarSign className="h-3.5 w-3.5" />
                          {Number(proj.budget).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {proj?.description && (
                    <p className="text-sm text-foreground/80 line-clamp-2 mb-3">
                      {proj.description}
                    </p>
                  )}

                  {i.message && (
                    <div className="text-sm bg-muted/50 rounded-md p-3 mb-3 whitespace-pre-wrap">
                      “{i.message}”
                    </div>
                  )}

                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground">
                      Received {format(new Date(i.created_at), "MMM d, yyyy")}
                    </span>
                    {i.status === "pending" && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => respond(i.id, "accepted")}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => respond(i.id, "rejected")}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyInvites;
