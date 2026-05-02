import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { FileText, DollarSign } from "lucide-react";
import { format } from "date-fns";

type Project = {
  id: string;
  title: string;
  description: string;
  budget: number;
  business_id: string;
  documentation_url: string | null;
  updated_at: string;
};

type Review = {
  id: string;
  project_id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
};

type Profile = { id: string; company_name: string | null; name: string | null };

const CompletedWork = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Find accepted proposals for the student
      const { data: props } = await supabase
        .from("proposals")
        .select("project_id")
        .eq("student_id", user.id)
        .eq("status", "accepted");

      const projectIds = (props ?? []).map((p) => p.project_id);
      if (projectIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data: projs } = await supabase
        .from("business_projects")
        .select("id, title, description, budget, business_id, documentation_url, updated_at")
        .in("id", projectIds)
        .eq("status", "completed")
        .order("updated_at", { ascending: false });

      const list = (projs ?? []) as Project[];
      setProjects(list);

      if (list.length) {
        // Reviews left FOR the student on these projects
        const { data: revs } = await supabase
          .from("reviews")
          .select("*")
          .in("project_id", list.map((p) => p.id))
          .eq("reviewee_id", user.id);
        const rMap: Record<string, Review> = {};
        (revs ?? []).forEach((r) => (rMap[r.project_id] = r as Review));
        setReviews(rMap);

        const bizIds = [...new Set(list.map((p) => p.business_id))];
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, company_name, name")
          .in("id", bizIds);
        const pMap: Record<string, Profile> = {};
        (profs ?? []).forEach((p) => (pMap[p.id] = p as Profile));
        setProfiles(pMap);
      }
      setLoading(false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="container-page py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">My completed work</h1>
        <p className="text-muted-foreground mb-8">
          Projects you've delivered, with the feedback you received.
        </p>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            You haven't completed any projects yet. Once a business marks one of your projects as completed, it'll appear here.
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => {
              const review = reviews[p.id];
              return (
                <Card key={p.id} className="p-6">
                  <div className="flex justify-between items-start gap-3 mb-2 flex-wrap">
                    <div>
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-display font-semibold text-lg hover:underline"
                      >
                        {p.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        For {profiles[p.business_id]?.company_name || "Business"} · Completed{" "}
                        {format(new Date(p.updated_at), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge>Completed</Badge>
                      <span className="text-sm font-semibold text-accent inline-flex items-center">
                        <DollarSign className="h-3.5 w-3.5" />
                        {Number(p.budget).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-foreground/80 line-clamp-3 mb-3">
                    {p.description}
                  </p>

                  {p.documentation_url && (
                    <a
                      href={p.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline mb-3"
                    >
                      <FileText className="h-4 w-4" />
                      Project document
                    </a>
                  )}

                  {review ? (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          Feedback received
                        </span>
                        <StarRating value={review.rating} size={14} />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      No feedback yet from the business.
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CompletedWork;
