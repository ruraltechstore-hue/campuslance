import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(4000),
  budget: z.number().positive().max(10_000_000),
});

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const NewProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setDocFile(null);
      return;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      toast.error("Unsupported file type. Use PDF, DOC, DOCX, or images.");
      e.target.value = "";
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File too large. Max 10MB.");
      e.target.value = "";
      return;
    }
    setDocFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({
      title,
      description,
      budget: Number(budget),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);

    let documentation_url: string | null = null;
    if (docFile) {
      const ext = docFile.name.split(".").pop() || "bin";
      const path = `${user!.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("project-documents")
        .upload(path, docFile, { contentType: docFile.type, upsert: false });
      if (upErr) {
        setLoading(false);
        toast.error(`Upload failed: ${upErr.message}`);
        return;
      }
      const { data: pub } = supabase.storage.from("project-documents").getPublicUrl(path);
      documentation_url = pub.publicUrl;
    }

    const { error } = await supabase.from("business_projects").insert({
      business_id: user!.id,
      title: title.trim(),
      description: description.trim(),
      required_skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      budget: Number(budget),
      deadline: deadline || null,
      category: category.trim() || null,
      documentation_url,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project posted!");
    navigate("/dashboard");
  }

  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Post a project</h1>
        <p className="text-muted-foreground mb-8">
          Describe what you need. Students will apply with proposals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="title">Project title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Landing page redesign"
              required
              maxLength={120}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              placeholder="What's the goal? Scope? Deliverables?"
              required
              maxLength={4000}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget (INR)</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="25000"
                required
              />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Design, Development, Marketing…"
              maxLength={50}
            />
          </div>
          <div>
            <Label htmlFor="skills">Required skills (comma-separated)</Label>
            <Input
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="React, Figma, Copywriting"
            />
          </div>

          <div>
            <Label htmlFor="doc">Supporting document (optional)</Label>
            <p className="text-xs text-muted-foreground mb-2">
              PDF, DOC, DOCX, or image. Max 10MB.
            </p>
            {docFile ? (
              <div className="flex items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                <span className="truncate">{docFile.name}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setDocFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer rounded-md border border-dashed border-input bg-background px-3 py-3 text-sm text-muted-foreground hover:bg-muted/40">
                <Upload className="h-4 w-4" />
                <span>Click to upload a file</span>
                <input
                  id="doc"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={onFileChange}
                />
              </label>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Posting…" : "Post project"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/dashboard")}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default NewProject;
