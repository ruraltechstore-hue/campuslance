import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Link } from "react-router-dom";

type Project = { id: string; title: string; status: string };

export function InviteStudentDialog({
  studentId,
  studentName,
  triggerLabel = "Invite to project",
  size = "sm",
  variant = "default",
}: {
  studentId: string;
  studentName?: string;
  triggerLabel?: string;
  size?: "default" | "sm" | "lg";
  variant?: "default" | "outline" | "secondary";
}) {
  const { user, role } = useAuth();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setLoading(true);
    (async () => {
      const { data } = await supabase
        .from("business_projects")
        .select("id, title, status")
        .eq("business_id", user.id)
        .eq("status", "open")
        .order("created_at", { ascending: false });
      setProjects((data ?? []) as Project[]);
      setLoading(false);
    })();
  }, [open, user]);

  if (role !== "business" || !user || user.id === studentId) return null;

  async function submit() {
    if (!projectId) {
      toast.error("Select a project to invite the student to.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("invites").insert({
      project_id: projectId,
      business_id: user!.id,
      student_id: studentId,
      message: message.trim(),
    });
    setSubmitting(false);
    if (error) {
      if (error.code === "23505") {
        toast.error("You've already invited this student to that project.");
      } else {
        toast.error(error.message);
      }
      return;
    }
    toast.success(`Invite sent${studentName ? ` to ${studentName}` : ""}.`);
    setOpen(false);
    setProjectId("");
    setMessage("");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size} variant={variant}>
          <Send className="h-3.5 w-3.5 mr-1" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Invite {studentName || "student"} to a project
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Project</Label>
            {loading ? (
              <p className="text-sm text-muted-foreground mt-1">Loading…</p>
            ) : projects.length === 0 ? (
              <div className="text-sm text-muted-foreground mt-1 space-y-2">
                <p>You don't have any open projects.</p>
                <Button asChild size="sm" variant="outline">
                  <Link to="/projects/new">Post a new project</Link>
                </Button>
              </div>
            ) : (
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an open project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div>
            <Label htmlFor="invite-msg">Message (optional)</Label>
            <Textarea
              id="invite-msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Tell them why you'd love to work with them…"
            />
          </div>
          <Button
            onClick={submit}
            disabled={submitting || !projectId}
            className="w-full"
          >
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
