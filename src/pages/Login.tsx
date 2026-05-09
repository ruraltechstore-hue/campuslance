import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";
import { PENDING_EMAIL_VERIFICATION_KEY } from "@/pages/CheckEmail";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const unconfirmed =
        /email not confirmed|email address not confirmed|confirm your email/i.test(error.message) ||
        (error as { code?: string }).code === "email_not_confirmed";
      if (unconfirmed) {
        sessionStorage.setItem(PENDING_EMAIL_VERIFICATION_KEY, email);
        toast.info("Verify your email", {
          description: "We sent a confirmation link. Check your inbox and tap the link to finish signing in.",
        });
        navigate("/check-email", { state: { email } });
        return;
      }
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate("/dashboard");
  }

  return (
    <Layout>
      <div className="container-page py-16 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-muted-foreground mb-8">Log in to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-11">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="text-foreground font-medium underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
