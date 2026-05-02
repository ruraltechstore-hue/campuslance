import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LeaveReviewDialog } from "@/components/LeaveReviewDialog";
import { StarRating } from "@/components/StarRating";
import { toast } from "sonner";
import { DollarSign, Calendar, Building2, ArrowLeft, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

type Project = {
  id: string;
  business_id: string;
  title: string;
  description: string;
  required_skills: string[];
  budget: number;
  deadline: string | null;
  category: string | null;
  status: string;
  documentation_url: string | null;
};

type Proposal = {
  id: string;
  student_id: string;
  message: string;
  timeline: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  skills: string[];
  company_name: string | null;
  industry: string | null;
};

type Review = {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string;
  created_at: string;
};

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [businessProfile, setBusinessProfile] = useState<Profile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [proposalProfiles, setProposalProfiles] = useState<Record<string, Profile>>({});
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [projectReviews, setProjectReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // proposal form
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!id) return;
    const { data: p } = await supabase
      .from("business_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    setProject(p as Project | null);
    if (p) {
      const { data: bp } = await supabase
        .from("profiles")
        .select("id, name, bio, skills, company_name, industry")
        .eq("id", p.business_id)
        .maybeSingle();
      setBusinessProfile(bp as Profile | null);

      const { data: props } = await supabase
        .from("proposals")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false });
      setProposals((props ?? []) as Proposal[]);

      if (user && role === "student") {
        setMyProposal(((props ?? []) as Proposal[]).find((x) => x.student_id === user.id) ?? null);
      }
      if (user && role === "business" && p.business_id === user.id && props?.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name, bio, skills, company_name, industry")
          .in("id", props.map((x) => x.student_id));
        const map: Record<string, Profile> = {};
        (profs ?? []).forEach((x) => (map[x.id] = x as Profile));
        setProposalProfiles(map);
      }

      const { data: revs } = await supabase
        .from("reviews")
        .select("*")
        .eq("project_id", id);
      setProjectReviews((revs ?? []) as Review[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  async function submitProposal(e: React.FormEvent) {
    e.preventDefault();
    if (message.trim().length < 20) {
      toast.error("Proposal message must be at least 20 characters.");
      return;
    }
    if (timeline.trim().length < 2) {
      toast.error("Add a timeline.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("proposals").insert({
      project_id: id!,
      student_id: user!.id,
      message: message.trim(),
      timeline: timeline.trim(),
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Proposal submitted!");
    setOpen(false);
    setMessage("");
    setTimeline("");
    load();
  }

  async function updateStatus(propId: string, status: "accepted" | "rejected") {
    const { error } = await supabase.from("proposals").update({ status }).eq("id", propId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Proposal ${status}.`);
    load();
  }

  async function markCompleted() {
    const { error } = await supabase
      .from("business_projects")
      .update({ status: "completed" })
      .eq("id", id!);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project marked completed.");
    load();
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-10">Loading…</div>
      </Layout>
    );
  }
  if (!project) {
    return (
      <Layout>
        <div className="container-page py-10">Project not found.</div>
      </Layout>
    );
  }

  const isOwner = user?.id === project.business_id;
  const acceptedProposal = proposals.find((p) => p.status === "accepted");
  const isAcceptedStudent = !!user && acceptedProposal?.student_id === user.id;
  const isCompleted = project.status === "completed";

  // Review eligibility
  const myReview = projectReviews.find((r) => r.reviewer_id === user?.id);
  const canReviewAsBusiness =
    isOwner && isCompleted && acceptedProposal && !myReview;
  const canReviewAsStudent =
    isAcceptedStudent && isCompleted && !myReview;

  // Reviews split for display
  const reviewerNames: Record<string, string> = {};
  if (businessProfile) {
    reviewerNames[businessProfile.id] = businessProfile.company_name || businessProfile.name || "Business";
  }
  Object.values(proposalProfiles).forEach((p) => {
    reviewerNames[p.id] = p.name || "Student";
  });

  return (
    <Layout>
      <div className="container-page py-10 max-w-4xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-3">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <Card className="p-8 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
            <div>
              <Badge variant="secondary" className="mb-3 capitalize">
                {project.status.replace("_", " ")}
              </Badge>
              <h1 className="font-display text-3xl font-bold mb-2">{project.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Building2 className="h-4 w-4" />
                {businessProfile?.company_name || "Business"}
                {businessProfile?.industry && ` · ${businessProfile.industry}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Budget</div>
              <div className="flex items-center gap-1 text-2xl font-bold text-accent">
                <DollarSign className="h-5 w-5" />
                {Number(project.budget).toLocaleString()}
              </div>
              {project.deadline && (
                <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Due {format(new Date(project.deadline), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>

          <p className="whitespace-pre-wrap text-foreground/90 leading-relaxed mb-6">
            {project.description}
          </p>

          {project.required_skills?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {project.required_skills.map((s) => (
                <Badge key={s} variant="outline" className="font-normal">
                  {s}
                </Badge>
              ))}
            </div>
          )}

          {project.documentation_url && (
            <div className="mt-2">
              <a
                href={project.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileText className="h-4 w-4" />
                View supporting document
              </a>
            </div>
          )}

          {role === "student" && project.status === "open" && (
            <div className="mt-6 pt-6 border-t border-border">
              {myProposal ? (
                <div className="text-sm">
                  <span className="text-muted-foreground">Your proposal status: </span>
                  <Badge
                    className="capitalize"
                    variant={
                      myProposal.status === "accepted"
                        ? "default"
                        : myProposal.status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {myProposal.status}
                  </Badge>
                </div>
              ) : (
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg">Apply to this project</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit your proposal</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitProposal} className="space-y-4">
                      <div>
                        <Label htmlFor="msg">Why are you a good fit?</Label>
                        <Textarea
                          id="msg"
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          rows={6}
                          maxLength={2000}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="tl">Timeline</Label>
                        <Input
                          id="tl"
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          placeholder="e.g. 2 weeks"
                          maxLength={100}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? "Submitting…" : "Submit proposal"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {/* Project completion + review actions */}
          {(isOwner || isAcceptedStudent) && (
            <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-3 items-center">
              {isOwner && !isCompleted && acceptedProposal && (
                <Button onClick={markCompleted} variant="outline">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as completed
                </Button>
              )}
              {canReviewAsBusiness && acceptedProposal && (
                <LeaveReviewDialog
                  projectId={project.id}
                  reviewerId={user!.id}
                  revieweeId={acceptedProposal.student_id}
                  onSubmitted={load}
                  triggerLabel="Review the student"
                />
              )}
              {canReviewAsStudent && (
                <LeaveReviewDialog
                  projectId={project.id}
                  reviewerId={user!.id}
                  revieweeId={project.business_id}
                  onSubmitted={load}
                  triggerLabel="Review the business"
                />
              )}
              {isCompleted && myReview && (
                <span className="text-sm text-muted-foreground">
                  ✓ You left a review for this project.
                </span>
              )}
            </div>
          )}
        </Card>

        {/* Project reviews */}
        {projectReviews.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-display text-lg font-bold mb-4">Project reviews</h2>
            <div className="space-y-3">
              {projectReviews.map((r) => (
                <div key={r.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-medium">
                      {reviewerNames[r.reviewer_id] || "User"}
                    </div>
                    <StarRating value={r.rating} size={14} />
                  </div>
                  {r.comment && (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                      {r.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {isOwner && (
          <div>
            <h2 className="font-display text-xl font-bold mb-4">
              Proposals ({proposals.length})
            </h2>
            {proposals.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                No proposals yet.
              </Card>
            ) : (
              <div className="space-y-3">
                {proposals.map((p) => {
                  const prof = proposalProfiles[p.student_id];
                  return (
                    <Card key={p.id} className="p-6">
                      <div className="flex justify-between items-start gap-4 mb-3 flex-wrap">
                        <div>
                          <div className="font-semibold">{prof?.name || "Student"}</div>
                          {prof?.bio && (
                            <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                              {prof.bio}
                            </p>
                          )}
                          {prof?.skills?.length ? (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {prof.skills.slice(0, 6).map((s) => (
                                <Badge key={s} variant="secondary" className="font-normal text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
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
                      <div className="text-sm bg-muted/50 rounded-md p-3 mb-3 whitespace-pre-wrap">
                        {p.message}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Timeline: <span className="text-foreground">{p.timeline}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/students/${p.student_id}`)}
                        >
                          View portfolio
                        </Button>
                        {p.status === "pending" && project.status === "open" && (
                          <>
                            <Button size="sm" onClick={() => updateStatus(p.id, "accepted")}>
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateStatus(p.id, "rejected")}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProjectDetail;
