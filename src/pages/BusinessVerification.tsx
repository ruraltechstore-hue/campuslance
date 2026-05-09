import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type DocType = Database["public"]["Enums"]["business_verification_doc_type"];
type CompanyType = Database["public"]["Enums"]["business_company_type"];
type VerificationRow = Database["public"]["Tables"]["business_verifications"]["Row"];
type DocRow = Database["public"]["Tables"]["business_verification_documents"]["Row"];

const DOC_LABELS: Record<DocType, string> = {
  registration_certificate: "Business registration certificate (registrar of companies)",
  tax_registration: "Tax identification (GST / VAT / equivalent)",
  proof_of_address: "Proof of address (utility bill, lease, etc.)",
  incorporation: "Incorporation documents",
  directors_info: "Director information",
  audited_financial: "Audited financials (optional)",
};

const BASE_DOCS: DocType[] = ["registration_certificate", "tax_registration", "proof_of_address"];
const PUBLIC_REQUIRED: DocType[] = ["incorporation", "directors_info"];
const OPTIONAL_PUBLIC: DocType = "audited_financial";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

const BusinessVerification = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verification, setVerification] = useState<VerificationRow | null>(null);
  const [docRows, setDocRows] = useState<Partial<Record<DocType, DocRow>>>({});
  const [companyType, setCompanyType] = useState<CompanyType>("private_company");
  const [taxId, setTaxId] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [files, setFiles] = useState<Partial<Record<DocType, File | null>>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: v } = await supabase
        .from("business_verifications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      setVerification(v);
      if (v) {
        setCompanyType(v.company_type);
        setTaxId(v.tax_id_number ?? "");
        setRegNumber(v.registration_number ?? "");
        const { data: docs } = await supabase
          .from("business_verification_documents")
          .select("*")
          .eq("verification_id", v.id);
        const map: Partial<Record<DocType, DocRow>> = {};
        (docs ?? []).forEach((d) => {
          map[d.doc_type as DocType] = d;
        });
        setDocRows(map);
      }
      setLoading(false);
    })();
  }, [user]);

  function requiredDocTypes(): DocType[] {
    const list = [...BASE_DOCS];
    if (companyType === "public_company") list.push(...PUBLIC_REQUIRED);
    return list;
  }

  function validate(): string | null {
    if (!taxId.trim()) return "Tax identification number / ID is required.";
    const need = requiredDocTypes();
    for (const dt of need) {
      if (!files[dt] && !docRows[dt]) {
        return `Please upload: ${DOC_LABELS[dt]}`;
      }
    }
    if (companyType === "public_company" && files[OPTIONAL_PUBLIC] === null) {
      /* optional — ok */
    }
    return null;
  }

  async function uploadDoc(vid: string, docType: DocType, file: File) {
    if (!user) throw new Error("Not signed in");
    const safe = sanitizeFileName(file.name);
    const path = `${user.id}/${docType}/${crypto.randomUUID()}_${safe}`;
    const { error: upErr } = await supabase.storage
      .from("business-verification")
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;

    const { error: rowErr } = await supabase.from("business_verification_documents").upsert(
      {
        verification_id: vid,
        doc_type: docType,
        storage_path: path,
        file_name: file.name,
      },
      { onConflict: "verification_id,doc_type" }
    );
    if (rowErr) throw rowErr;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const msg = validate();
    if (msg) {
      toast.error(msg);
      return;
    }

    if (verification?.status === "pending_review" || verification?.status === "approved") {
      toast.info("This application is locked. Contact support if you need changes.");
      return;
    }

    setSubmitting(true);
    try {
      let vid = verification?.id;
      if (!vid) {
        const { data: inserted, error: insErr } = await supabase
          .from("business_verifications")
          .insert({
            user_id: user.id,
            company_type: companyType,
            status: "draft",
            tax_id_number: taxId.trim(),
            registration_number: regNumber.trim() || null,
          })
          .select("id")
          .single();
        if (insErr) throw insErr;
        vid = inserted.id;
      }

      const toUpload: DocType[] = [...requiredDocTypes()];
      if (companyType === "public_company" && files[OPTIONAL_PUBLIC]) {
        toUpload.push(OPTIONAL_PUBLIC);
      }

      for (const dt of toUpload) {
        const f = files[dt];
        if (f) await uploadDoc(vid, dt, f);
      }

      const { error: updErr } = await supabase
        .from("business_verifications")
        .update({
          company_type: companyType,
          tax_id_number: taxId.trim(),
          registration_number: regNumber.trim() || null,
          status: "pending_review",
          submitted_at: new Date().toISOString(),
          rejection_reason: null,
        })
        .eq("id", vid);

      if (updErr) throw updErr;

      const { data: fresh } = await supabase
        .from("business_verifications")
        .select("*")
        .eq("id", vid)
        .single();
      setVerification(fresh);
      const { data: docs } = await supabase
        .from("business_verification_documents")
        .select("*")
        .eq("verification_id", vid);
      const map: Partial<Record<DocType, DocRow>> = {};
      (docs ?? []).forEach((d) => {
        map[d.doc_type as DocType] = d;
      });
      setDocRows(map);
      setFiles({});
      toast.success("Submitted for review. We will notify you by email when it is processed.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <Layout>
        <div className="container-page py-16 text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  const status = verification?.status;
  const locked = status === "pending_review" || status === "approved";

  return (
    <Layout>
      <div className="container-page py-10 max-w-2xl">
        <h1 className="font-display text-3xl font-bold mb-2">Business verification</h1>
        <p className="text-muted-foreground mb-8">
          Upload documents so we can confirm your organization. Posting projects is enabled after
          approval.
        </p>

        {status === "approved" && (
          <Card className="mb-6 border-accent">
            <CardHeader>
              <CardTitle>Verified</CardTitle>
              <CardDescription>
                Your business is verified. You can post projects and use all business features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {status === "pending_review" && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Under review</CardTitle>
              <CardDescription>
                Our team is reviewing your documents. This usually takes a short time.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {status === "rejected" && verification?.rejection_reason && (
          <Card className="mb-6 border-destructive/50">
            <CardHeader>
              <CardTitle>Needs revision</CardTitle>
              <CardDescription>{verification.rejection_reason}</CardDescription>
            </CardHeader>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Company type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={companyType}
                onValueChange={(v) => setCompanyType(v as CompanyType)}
                disabled={locked}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private_company" id="pc" />
                  <Label htmlFor="pc">Private company</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public_company" id="pub" />
                  <Label htmlFor="pub">Public company</Label>
                </div>
              </RadioGroup>
              {companyType === "public_company" && (
                <p className="text-sm text-muted-foreground mt-3">
                  Public companies must also provide incorporation documents and director information.
                  Audited financials are optional but help us verify faster.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identifiers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tax">Tax ID (GST, VAT, or equivalent)</Label>
                <Input
                  id="tax"
                  value={taxId}
                  onChange={(e) => setTaxId(e.target.value)}
                  disabled={locked}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reg">Company registration number (optional)</Label>
                <Input
                  id="reg"
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  disabled={locked}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documents</CardTitle>
              <CardDescription>PDF or images up to ~15MB each.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {([...requiredDocTypes(), ...(companyType === "public_company" ? [OPTIONAL_PUBLIC] : [])] as DocType[])
                .filter((dt, i, arr) => arr.indexOf(dt) === i)
                .map((dt) => (
                  <div key={dt}>
                    <Label htmlFor={`f-${dt}`}>
                      {DOC_LABELS[dt]}
                      {dt === OPTIONAL_PUBLIC ? " (optional)" : ""}
                    </Label>
                    {docRows[dt] && !files[dt] && (
                      <p className="text-sm text-muted-foreground mt-1">
                        On file: {docRows[dt]!.file_name}
                      </p>
                    )}
                    <Input
                      id={`f-${dt}`}
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      disabled={locked}
                      className="mt-2"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setFiles((prev) => ({ ...prev, [dt]: f }));
                      }}
                    />
                  </div>
                ))}
            </CardContent>
          </Card>

          {!locked && (
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit for review"}
            </Button>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default BusinessVerification;
