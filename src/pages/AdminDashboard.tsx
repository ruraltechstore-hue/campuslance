import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AdminActivityMonitor } from "@/components/AdminActivityMonitor";

const AdminDashboard = () => {
  const [pending, setPending] = useState<number | null>(null);
  const [approved, setApproved] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { count: p } = await supabase
        .from("business_verifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending_review");
      const { count: a } = await supabase
        .from("business_verifications")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");
      setPending(p ?? 0);
      setApproved(a ?? 0);
    })();
  }, []);

  return (
    <Layout>
      <div className="container-page py-10 max-w-5xl">
        <h1 className="font-display text-3xl font-bold mb-2">Admin</h1>
        <p className="text-muted-foreground mb-8">Business verification and platform oversight.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl tabular-nums">
                {pending === null ? "—" : pending}
              </CardTitle>
              <CardDescription>Pending review</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/admin/verifications">Open verification queue</Link>
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl tabular-nums">
                {approved === null ? "—" : approved}
              </CardTitle>
              <CardDescription>Approved businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Counts include all approved records in the system.</p>
            </CardContent>
          </Card>
        </div>

        <AdminActivityMonitor />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
