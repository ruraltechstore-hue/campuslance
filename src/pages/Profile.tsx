import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ReviewsList } from "@/components/ReviewsList";

const Profile = () => {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // shared
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolioLinks, setPortfolioLinks] = useState("");
  // business
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        setName(data.name || "");
        setBio(data.bio || "");
        setSkills((data.skills || []).join(", "));
        setPortfolioLinks((data.portfolio_links || []).join(", "));
        setCompanyName(data.company_name || "");
        setIndustry(data.industry || "");
        setCompanyDescription(data.company_description || "");
      }
      setLoading(false);
    })();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const updates =
      role === "student" || role === "admin"
        ? {
            name: name.trim() || null,
            bio: bio.trim() || null,
            skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
            portfolio_links: portfolioLinks.split(",").map((s) => s.trim()).filter(Boolean),
          }
        : {
            company_name: companyName.trim() || null,
            industry: industry.trim() || null,
            company_description: companyDescription.trim() || null,
          };
    const { error } = await supabase.from("profiles").update(updates).eq("id", user!.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Profile saved!");
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-10">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Your profile</h1>
        <p className="text-muted-foreground mb-8">
          {role === "student"
            ? "Help businesses understand what you bring to the table."
            : role === "admin"
              ? "Your admin account profile."
              : "Tell students about your company."}
        </p>

        <Card className="p-6">
          <form onSubmit={save} className="space-y-4">
            {role === "student" || role === "admin" ? (
              <>
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} maxLength={1000} />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Figma, Copywriting" />
                </div>
                <div>
                  <Label htmlFor="links">Portfolio links (comma-separated)</Label>
                  <Input id="links" value={portfolioLinks} onChange={(e) => setPortfolioLinks(e.target.value)} placeholder="https://github.com/...,https://dribbble.com/..." />
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="cn">Company name</Label>
                  <Input id="cn" value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="ind">Industry</Label>
                  <Input id="ind" value={industry} onChange={(e) => setIndustry(e.target.value)} maxLength={80} />
                </div>
                <div>
                  <Label htmlFor="cd">Company description</Label>
                  <Textarea id="cd" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} rows={4} maxLength={1000} />
                </div>
              </>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </form>
        </Card>

        {user && (
          <div className="mt-10">
            <ReviewsList userId={user.id} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
