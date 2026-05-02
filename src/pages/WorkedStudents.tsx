import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/StarRating";
import { InviteStudentDialog } from "@/components/InviteStudentDialog";
import { format } from "date-fns";

type WorkedItem = {
  studentId: string;
  name: string | null;
  skills: string[];
  projects: { id: string; title: string; completedAt: string }[];
  avgRating: number | null;
  reviewCount: number;
};

const WorkedStudents = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<WorkedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Completed projects owned by this business
      const { data: projects } = await supabase
        .from("business_projects")
        .select("id, title, updated_at")
        .eq("business_id", user.id)
        .eq("status", "completed");

      const projectIds = (projects ?? []).map((p) => p.id);
      if (projectIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      // Accepted proposals on those projects
      const { data: props } = await supabase
        .from("proposals")
        .select("project_id, student_id")
        .in("project_id", projectIds)
        .eq("status", "accepted");

      const studentIds = [...new Set((props ?? []).map((p) => p.student_id))];
      if (studentIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, name, skills")
        .in("id", studentIds);

      // Reviews left FOR each student
      const { data: reviews } = await supabase
        .from("reviews")
        .select("reviewee_id, rating")
        .in("reviewee_id", studentIds);

      const projMap = new Map(
        (projects ?? []).map((p) => [p.id, { title: p.title, completedAt: p.updated_at }])
      );
      const profMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const ratingsByStudent: Record<string, number[]> = {};
      (reviews ?? []).forEach((r) => {
        ratingsByStudent[r.reviewee_id] = ratingsByStudent[r.reviewee_id] || [];
        ratingsByStudent[r.reviewee_id].push(r.rating);
      });

      const grouped: Record<string, WorkedItem> = {};
      (props ?? []).forEach((pr) => {
        const sid = pr.student_id;
        const proj = projMap.get(pr.project_id);
        const prof = profMap.get(sid);
        if (!grouped[sid]) {
          const ratings = ratingsByStudent[sid] || [];
          grouped[sid] = {
            studentId: sid,
            name: prof?.name ?? null,
            skills: prof?.skills ?? [],
            projects: [],
            avgRating: ratings.length
              ? ratings.reduce((a, b) => a + b, 0) / ratings.length
              : null,
            reviewCount: ratings.length,
          };
        }
        if (proj) {
          grouped[sid].projects.push({
            id: pr.project_id,
            title: proj.title,
            completedAt: proj.completedAt,
          });
        }
      });

      setItems(Object.values(grouped));
      setLoading(false);
    })();
  }, [user]);

  return (
    <Layout>
      <div className="container-page py-10 max-w-4xl">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Worked students</h1>
          <p className="text-muted-foreground">
            Students you've completed projects with. Invite them again with one click.
          </p>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            No completed projects yet. Mark a project as completed to see your past collaborators here.
          </Card>
        ) : (
          <div className="grid gap-4">
            {items.map((s) => (
              <Card key={s.studentId} className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                  <div>
                    <Link
                      to={`/students/${s.studentId}`}
                      className="font-display font-semibold text-lg hover:underline"
                    >
                      {s.name || "Student"}
                    </Link>
                    {s.avgRating !== null && (
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating value={Math.round(s.avgRating)} size={14} />
                        <span className="text-xs text-muted-foreground">
                          {s.avgRating.toFixed(1)} · {s.reviewCount} review
                          {s.reviewCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    )}
                  </div>
                  <InviteStudentDialog
                    studentId={s.studentId}
                    studentName={s.name || undefined}
                  />
                </div>

                {s.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {s.skills.slice(0, 8).map((sk) => (
                      <Badge key={sk} variant="secondary" className="font-normal text-xs">
                        {sk}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                  Past projects
                </div>
                <div className="space-y-1.5">
                  {s.projects.map((p) => (
                    <div
                      key={p.id}
                      className="flex justify-between items-center text-sm"
                    >
                      <Link
                        to={`/projects/${p.id}`}
                        className="hover:underline"
                      >
                        {p.title}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        Completed {format(new Date(p.completedAt), "MMM d, yyyy")}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8">
          <Button variant="outline" asChild>
            <Link to="/students">Browse all students</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default WorkedStudents;
