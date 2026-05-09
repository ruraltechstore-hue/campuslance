import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DocType = Database["public"]["Enums"]["business_verification_doc_type"];
type VerificationRow = Database["public"]["Tables"]["business_verifications"]["Row"];
type DocRow = Database["public"]["Tables"]["business_verification_documents"]["Row"];

const DOC_LABELS: Record<DocType, string> = {
  registration_certificate: "Business registration certificate",
  tax_registration: "Tax registration",
  proof_of_address: "Proof of address",
  incorporation: "Incorporation",
  directors_info: "Directors information",
  audited_financial: "Audited financial",
};

const AdminVerificationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationRow | null>(null);
  const [profile, setProfile] = useState<{ email: string; company_name: string | null } | null>(null);
  const [documents, setDocuments] = useState<DocRow[]>([]);
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: v } = await supabase.from("business_verifications").select("*").eq("id", id).maybeSingle();
      setVerification(v);
      if (!v) {
        setLoading(false);
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("email, company_name")
        .eq("id", v.user_id)
        .maybeSingle();
      setProfile(p);
      const { data: docs } = await supabase.from("business_verification_documents").select("*").eq("verification_id", id);
      setDocuments(docs ?? []);

      const nextUrls: Record<string, string> = {};
      for (const d of docs ?? []) {
        const { data: signed } = await supabase.storage
          .from("business-verification")
          .createSignedUrl(d.storage_path, 3600);
        if (signed?.signedUrl) nextUrls[d.id] = signed.signedUrl;
      }
      setUrls(nextUrls);
      setLoading(false);
    })();
  }, [id]);

  async function approve() {
    if (!id || !user) return;
    setActing(true);
    const { error } = await supabase
      .from("business_verifications")
      .update({
        status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: null,
      })
      .eq("id", id);
    setActing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Business approved.");
    navigate("/admin/verifications");
  }

  async function reject() {
    if (!id || !user) return;
    const reason = rejectReason.trim();
    if (!reason) {
      toast.error("Please provide a rejection reason.");
      return;
    }
    setActing(true);
    const { error } = await supabase
      .from("business_verifications")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        rejection_reason: reason,
      })
      .eq("id", id);
    setActing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Application rejected.");
    navigate("/admin/verifications");
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-page py-16 text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!verification) {
    return (
      <Layout>
        <div className="container-page py-16">
          <p>Not found.</p>
          <Button asChild variant="link" className="mt-2 px-0">
            <Link to="/admin/verifications">Back to queue</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-page py-10 max-w-3xl">
        <Button variant="ghost" size="sm" className="mb-6 -ml-2" asChild>
          <Link to="/admin/verifications">← Queue</Link>
        </Button>

        <h1 className="font-display text-3xl font-bold mb-2">{profile?.company_name || "Business"}</h1>
        <p className="text-muted-foreground mb-8">{profile?.email}</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Application</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Company type: </span>
              <span className="capitalize">{verification.company_type.replace("_", " ")}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Tax ID: </span>
              {verification.tax_id_number || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Registration no.: </span>
              {verification.registration_number || "—"}
            </p>
            <p>
              <span className="text-muted-foreground">Status: </span>
              {verification.status.replace("_", " ")}
            </p>
          </CardContent>
        </Card>

        <h2 className="font-semibold mb-3">Documents</h2>
        <ul className="space-y-3 mb-10">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center justify-between gap-2 border border-border rounded-lg p-3">
              <span className="text-sm">
                {DOC_LABELS[d.doc_type as DocType]}
                <span className="text-muted-foreground"> — {d.file_name}</span>
              </span>
              {urls[d.id] ? (
                <a
                  href={urls[d.id]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Download
                </a>
              ) : (
                <span className="text-xs text-muted-foreground">Link unavailable</span>
              )}
            </li>
          ))}
        </ul>

        {verification.status === "pending_review" && (
          <div className="flex flex-col gap-4">
            <Button onClick={approve} disabled={acting} type="button">
              Approve business
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={acting} type="button">
                  Reject
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject this application?</AlertDialogTitle>
                  <AlertDialogDescription>
                    The business will see this reason and can resubmit.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-2">
                  <Label htmlFor="reject-dlg">Reason (required)</Label>
                  <Textarea
                    id="reject-dlg"
                    className="mt-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                  <Button variant="destructive" type="button" disabled={acting} onClick={() => void reject()}>
                    Reject application
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminVerificationDetail;
