import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/StarRating";
import { LeaveReviewDialog } from "@/components/LeaveReviewDialog";
import { FileText, DollarSign, CheckCircle2 } from "lucide-react";
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
  reviewee_id: string;
  rating: number;
  comment: string;
};

type Profile = { id: string; company_name: string | null; name: string | null };

const CompletedWork = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  // reviews FOR the student (received from business)
  const [receivedReviews, setReceivedReviews] = useState<Record<string, Review>>({});
  // reviews BY the student (given to business)
  const [givenReviews, setGivenReviews] = useState<Record<string, Review>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  // Auto-prompt feedback modal state
  const [autoPromptProjectId, setAutoPromptProjectId] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    const { data: props } = await supabase
      .from("proposals")
      .select("project_id")
      .eq("student_id", user.id)
      .eq("status", "accepted");

    const projectIds = (props ?? []).map((p) => p.project_id);
    if (projectIds.length === 0) {
      setProjects([]);
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
      const ids = list.map((p) => p.id);
      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .in("project_id", ids);

      const recv: Record<string, Review> = {};
      const given: Record<string, Review> = {};
      (revs ?? []).forEach((r) => {
        const rev = r as Review;
        if (rev.reviewee_id === user.id) recv[rev.project_id] = rev;
        if (rev.reviewer_id === user.id) given[rev.project_id] = rev;
      });
      setReceivedReviews(recv);
      setGivenReviews(given);

      const bizIds = [...new Set(list.map((p) => p.business_id))];
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, company_name, name")
        .in("id", bizIds);
      const pMap: Record<string, Profile> = {};
      (profs ?? []).forEach((p) => (pMap[p.id] = p as Profile));
      setProfiles(pMap);

      // Auto-prompt: most recently completed project where the student
      // hasn't yet given feedback. Only prompt once per project (localStorage).
      const pending = list.find((p) => !given[p.id]);
      if (pending) {
        const key = `cl_feedback_prompted_${pending.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, "1");
          setAutoPromptProjectId(pending.id);
        }
      }
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const autoPromptProject = projects.find((p) => p.id === autoPromptProjectId);

  return (
    <Layout>
      <div className="container-page py-10 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">My completed work</h1>
        <p className="text-muted-foreground mb-8">
          Projects you've delivered. Share your experience with the businesses you worked with.
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
              const received = receivedReviews[p.id];
              const given = givenReviews[p.id];
              const businessName =
                profiles[p.business_id]?.company_name ||
                profiles[p.business_id]?.name ||
                "Business";
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
                        For {businessName} · Completed{" "}
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

                  {/* Student's feedback FOR the business */}
                  <div className="mt-3 pt-3 border-t border-border">
                    {given ? (
                      <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-accent" />
                        Feedback submitted
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <span className="text-sm text-muted-foreground">
                          Share your experience with {businessName}.
                        </span>
                        <LeaveReviewDialog
                          projectId={p.id}
                          reviewerId={user!.id}
                          revieweeId={p.business_id}
                          onSubmitted={load}
                          triggerLabel="Give Feedback"
                          title={`Rate your experience with ${businessName}`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Feedback received from business */}
                  {received && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">
                          Feedback received
                        </span>
                        <StarRating value={received.rating} size={14} />
                      </div>
                      {received.comment && (
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                          {received.comment}
                        </p>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Auto-prompt modal for most recently completed unreviewed project */}
      {autoPromptProject && user && (
        <LeaveReviewDialog
          projectId={autoPromptProject.id}
          reviewerId={user.id}
          revieweeId={autoPromptProject.business_id}
          open={true}
          onOpenChange={(o) => {
            if (!o) setAutoPromptProjectId(null);
          }}
          hideTrigger
          onSubmitted={() => {
            setAutoPromptProjectId(null);
            load();
          }}
          title={`Project completed! Rate your experience with ${
            profiles[autoPromptProject.business_id]?.company_name ||
            profiles[autoPromptProject.business_id]?.name ||
            "this business"
          }`}
        />
      )}
    </Layout>
  );
};

export default CompletedWork;
