import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ExternalLink, Plus, Trash2, ArrowLeft } from "lucide-react";
import { ReviewsList } from "@/components/ReviewsList";

type StudentProject = {
  id: string;
  student_id: string;
  title: string;
  description: string;
  image_url: string | null;
  project_url: string | null;
  skills: string[];
  category: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  name: string | null;
  bio: string | null;
  skills: string[];
  portfolio_links: string[];
};

const Portfolio = () => {
  const { user, role } = useAuth();
  const { id: routeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const ownerId = routeId || user?.id;
  const isOwner = !routeId || routeId === user?.id;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [items, setItems] = useState<StudentProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [projectUrl, setProjectUrl] = useState("");
  const [skills, setSkills] = useState("");
  const [category, setCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    if (!ownerId) return;
    const [{ data: prof }, { data: projs }] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, name, bio, skills, portfolio_links")
        .eq("id", ownerId)
        .maybeSingle(),
      supabase
        .from("student_projects")
        .select("*")
        .eq("student_id", ownerId)
        .order("created_at", { ascending: false }),
    ]);
    setProfile(prof as Profile | null);
    setItems((projs ?? []) as StudentProject[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownerId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2 || description.trim().length < 10) {
      toast.error("Add a title and description.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("student_projects").insert({
      student_id: user!.id,
      title: title.trim(),
      description: description.trim(),
      image_url: imageUrl.trim() || null,
      project_url: projectUrl.trim() || null,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      category: category.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Added to portfolio!");
    setOpen(false);
    setTitle("");
    setDescription("");
    setImageUrl("");
    setProjectUrl("");
    setSkills("");
    setCategory("");
    load();
  }

  async function remove(itemId: string) {
    const { error } = await supabase.from("student_projects").delete().eq("id", itemId);
    if (error) return toast.error(error.message);
    toast.success("Removed");
    load();
  }

  return (
    <Layout>
      <div className="container-page py-10 max-w-4xl">
        {routeId && (
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4 -ml-3">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        )}

        <div className="flex justify-between items-start gap-4 mb-8 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">
              {isOwner ? "My portfolio" : profile?.name || "Student portfolio"}
            </h1>
            {profile?.bio && (
              <p className="text-muted-foreground max-w-xl">{profile.bio}</p>
            )}
            {profile?.skills?.length ? (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="font-normal">
                    {s}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          {isOwner && role === "student" && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" /> Add work
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Add portfolio item</DialogTitle>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-3">
                  <div>
                    <Label htmlFor="t">Title</Label>
                    <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
                  </div>
                  <div>
                    <Label htmlFor="d">Description</Label>
                    <Textarea id="d" value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} maxLength={2000} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="img">Image URL</Label>
                      <Input id="img" type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="url">Project link</Label>
                      <Input id="url" type="url" value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="cat">Category</Label>
                      <Input id="cat" value={category} onChange={(e) => setCategory(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="sk">Skills (comma-sep.)</Label>
                      <Input id="sk" value={skills} onChange={(e) => setSkills(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? "Saving…" : "Save"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">
            {isOwner ? "Showcase your best work — add your first piece." : "No work posted yet."}
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {items.map((it) => (
              <Card key={it.id} className="overflow-hidden group">
                {it.image_url && (
                  <div className="aspect-video bg-muted overflow-hidden">
                    <img
                      src={it.image_url}
                      alt={it.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className="font-display font-semibold">{it.title}</h3>
                    {isOwner && (
                      <button
                        onClick={() => remove(it.id)}
                        className="text-muted-foreground hover:text-destructive transition"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {it.category && (
                    <div className="text-xs text-muted-foreground mb-2">{it.category}</div>
                  )}
                  <p className="text-sm text-foreground/80 line-clamp-3 mb-3">{it.description}</p>
                  {it.skills?.length ? (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {it.skills.slice(0, 4).map((s) => (
                        <Badge key={s} variant="outline" className="font-normal text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {it.project_url && (
                    <a
                      href={it.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-accent font-medium hover:underline"
                    >
                      View project <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {ownerId && (
          <div className="mt-10">
            <ReviewsList userId={ownerId} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Portfolio;
