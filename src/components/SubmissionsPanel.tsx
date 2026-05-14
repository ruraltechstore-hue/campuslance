import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "sonner";
import { Upload, ExternalLink, Download, FileArchive, CheckCircle2, RefreshCcw } from "lucide-react";
import { format } from "date-fns";

type Submission = {
  id: string;
  project_id: string;
  student_id: string;
  file_url: string | null;
  project_url: string | null;
  message: string;
  status: "submitted" | "revision_requested" | "approved";
  created_at: string;
};

interface Props {
  projectId: string;
  projectStatus: string;
  isAssignedStudent: boolean;
  isOwner: boolean;
  studentId?: string; // assigned student id (needed for upload path)
  onChanged?: () => void;
}

const MAX_SIZE = 20 * 1024 * 1024; // 20MB

export function SubmissionsPanel({
  projectId,
  projectStatus,
  isAssignedStudent,
  isOwner,
  studentId,
  onChanged,
}: Props) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [projectUrl, setProjectUrl] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const { data } = await supabase
      .from("submissions")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setSubmissions((data ?? []) as Submission[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const latest = submissions[0];
  // Allow submission for the assigned student whenever the project is active
  // (accepted/in_progress) or a revision was requested. Block only on submitted/completed.
  const activeForSubmission =
    projectStatus === "in_progress" ||
    projectStatus === "accepted" ||
    projectStatus === "open";
  const canSubmit =
    isAssignedStudent &&
    (activeForSubmission ||
      (latest && latest.status === "revision_requested"));
  const isResubmit = !!latest && latest.status === "revision_requested";

  function resetForm() {
    setFile(null);
    setProjectUrl("");
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) return;
    if (!file && !projectUrl.trim()) {
      toast.error("Provide a file or a project URL.");
      return;
    }
    if (file) {
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast.error("Only ZIP files are allowed.");
        return;
      }
      if (file.size > MAX_SIZE) {
        toast.error("File must be 20MB or less.");
        return;
      }
    }

    setSubmitting(true);
    let fileUrl: string | null = null;

    try {
      if (file) {
        const path = `${projectId}/${studentId}/${Date.now()}-${file.name}`;
        const { error: upErr } = await supabase.storage
          .from("project-submissions")
          .upload(path, file, { upsert: false, contentType: "application/zip" });
        if (upErr) throw upErr;
        fileUrl = path;
      }

      if (isResubmit && latest) {
        const { error } = await supabase
          .from("submissions")
          .update({
            file_url: fileUrl ?? latest.file_url,
            project_url: projectUrl.trim() || null,
            message: message.trim(),
            status: "submitted",
          })
          .eq("id", latest.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("submissions").insert({
          project_id: projectId,
          student_id: studentId,
          file_url: fileUrl,
          project_url: projectUrl.trim() || null,
          message: message.trim(),
          status: "submitted",
        });
        if (error) throw error;
      }

      toast.success("Work submitted!");
      setOpen(false);
      resetForm();
      await load();
      onChanged?.();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function review(id: string, status: "approved" | "revision_requested") {
    const { error } = await supabase
      .from("submissions")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Submission approved." : "Revision requested.");
    await load();
    onChanged?.();
  }

  async function downloadFile(path: string) {
    const { data, error } = await supabase.storage
      .from("project-submissions")
      .createSignedUrl(path, 60);
    if (error || !data) {
      toast.error("Could not generate download link.");
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  if (loading) return null;

  // If nobody should see this section
  if (!isAssignedStudent && !isOwner) return null;

  return (
    <Card className="p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h2 className="font-display text-lg font-bold">Work submissions</h2>
        {canSubmit && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                {isResubmit ? "Resubmit work" : "Submit work"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isResubmit ? "Resubmit work" : "Submit your work"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="file">ZIP file (max 20MB)</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".zip,application/zip,application/x-zip-compressed"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                <div>
                  <Label htmlFor="url">Project URL (optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    maxLength={500}
                  />
                </div>
                <div>
                  <Label htmlFor="msg">Message</Label>
                  <Textarea
                    id="msg"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    maxLength={2000}
                    placeholder="Notes for the business…"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Provide at least a file or a project URL.
                </p>
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Submitting…" : isResubmit ? "Resubmit" : "Submit work"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {isAssignedStudent
            ? "No submissions yet. Submit your work when ready."
            : "The student hasn't submitted any work yet."}
        </p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s, idx) => (
            <div
              key={s.id}
              className="border border-border rounded-md p-4"
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      s.status === "approved"
                        ? "default"
                        : s.status === "revision_requested"
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {s.status.replace("_", " ")}
                  </Badge>
                  {idx === 0 && (
                    <span className="text-xs text-muted-foreground">Latest</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(s.created_at), "MMM d, yyyy · h:mm a")}
                </span>
              </div>

              {s.message && (
                <p className="text-sm text-foreground/90 whitespace-pre-wrap mb-3">
                  {s.message}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-3">
                {s.file_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(s.file_url!)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    <FileArchive className="h-3.5 w-3.5 mr-1.5" />
                    Download ZIP
                  </Button>
                )}
                {s.project_url && (
                  <a
                    href={s.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline px-3 py-1.5 border border-border rounded-md"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open project URL
                  </a>
                )}
              </div>

              {isOwner && idx === 0 && s.status === "submitted" && (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button size="sm" onClick={() => review(s.id, "approved")}>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => review(s.id, "revision_requested")}
                  >
                    <RefreshCcw className="h-4 w-4 mr-1.5" />
                    Request revision
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
