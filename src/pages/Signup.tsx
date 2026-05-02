import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { GraduationCap, Briefcase } from "lucide-react";

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(8, "At least 8 characters").max(72),
  name: z.string().trim().min(1, "Required").max(100),
});

const Signup = () => {
  const [params] = useSearchParams();
  const initialRole = (params.get("role") === "business" ? "business" : "student") as
    | "student"
    | "business";
  const [role, setRole] = useState<"student" | "business">(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse({ email, password, name });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          role,
          name: role === "student" ? name : null,
          company_name: role === "business" ? name : null,
        },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome to CampusLance!");
    navigate("/dashboard");
  }

  return (
    <Layout>
      <div className="container-page py-16 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-muted-foreground mb-8">Pick a role to get started.</p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`p-4 rounded-lg border text-left transition ${
              role === "student"
                ? "border-accent bg-accent-soft"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <GraduationCap className="h-5 w-5 mb-2 text-accent" />
            <div className="font-semibold text-sm">Student</div>
            <div className="text-xs text-muted-foreground">Find work & build portfolio</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("business")}
            className={`p-4 rounded-lg border text-left transition ${
              role === "business"
                ? "border-accent bg-accent-soft"
                : "border-border hover:border-muted-foreground"
            }`}
          >
            <Briefcase className="h-5 w-5 mb-2 text-accent" />
            <div className="font-semibold text-sm">Business</div>
            <div className="text-xs text-muted-foreground">Hire student talent</div>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">{role === "student" ? "Full name" : "Company name"}</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          Already have one?{" "}
          <Link to="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Signup;
