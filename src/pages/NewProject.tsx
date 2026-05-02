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

const schema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(20).max(4000),
  budget: z.number().positive().max(10_000_000),
});

const NewProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

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
    const { error } = await supabase.from("business_projects").insert({
      business_id: user!.id,
      title: title.trim(),
      description: description.trim(),
      required_skills: skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      budget: Number(budget),
      deadline: deadline || null,
      category: category.trim() || null,
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
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                min={1}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="500"
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
