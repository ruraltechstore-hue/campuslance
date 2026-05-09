import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/integrations/supabase/types";

type VerificationRow = Database["public"]["Tables"]["business_verifications"]["Row"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "id" | "email" | "company_name">;

type Row = VerificationRow & { profiles?: ProfileRow | null };

const AdminVerifications = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: list } = await supabase
        .from("business_verifications")
        .select("*")
        .eq("status", "pending_review")
        .order("submitted_at", { ascending: true });

      const ids = (list ?? []).map((r) => r.user_id);
      const profilesById: Record<string, ProfileRow> = {};
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, email, company_name").in("id", ids);
        (profs ?? []).forEach((p) => {
          profilesById[p.id] = p;
        });
      }

      setRows((list ?? []).map((r) => ({ ...r, profiles: profilesById[r.user_id] ?? null })));
      setLoading(false);
    })();
  }, []);

  return (
    <Layout>
      <div className="container-page py-10">
        <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Verification queue</h1>
            <p className="text-muted-foreground">Review submitted business documents.</p>
          </div>
          <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            Admin home
          </Link>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No pending applications.</Card>
        ) : (
          <div className="space-y-3">
            {rows.map((r) => (
              <Card key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold">{r.profiles?.company_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">{r.profiles?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="capitalize">
                      {r.company_type.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Submitted {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : "—"}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/admin/verifications/${r.id}`}
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline shrink-0"
                >
                  Review
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminVerifications;
