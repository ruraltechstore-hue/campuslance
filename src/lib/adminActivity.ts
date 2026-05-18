import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type ActivityAudience = "student" | "business";

export type ActivityKind =
  | "account"
  | "project"
  | "application"
  | "submission"
  | "review"
  | "verification"
  | "login";

export type AdminActivityEvent = {
  id: string;
  audience: ActivityAudience;
  userId: string;
  userName: string;
  description: string;
  occurredAt: string;
  kind: ActivityKind;
};

const QUERY_LIMIT = 40;
const MERGE_CAP = 150;

type ProfileRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "id" | "email" | "name" | "company_name" | "created_at"
>;

type AppRole = Database["public"]["Enums"]["app_role"];

function profileDisplayName(p: ProfileRow): string {
  return p.name?.trim() || p.company_name?.trim() || p.email;
}

function isAfterCreate(updatedAt: string, createdAt: string): boolean {
  return new Date(updatedAt).getTime() > new Date(createdAt).getTime() + 1000;
}

function docTypeLabel(docType: string): string {
  return docType.replace(/_/g, " ");
}

export async function fetchAdminActivity(): Promise<AdminActivityEvent[]> {
  const [
    profilesRes,
    rolesRes,
    projectsRes,
    proposalsRes,
    submissionsRes,
    reviewsRes,
    verificationsRes,
    allVerificationsRes,
    verifDocsRes,
    signInsRes,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, email, name, company_name, created_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase.from("user_roles").select("user_id, role"),
    supabase
      .from("business_projects")
      .select("id, title, business_id, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase
      .from("proposals")
      .select("id, student_id, project_id, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase
      .from("submissions")
      .select("id, student_id, project_id, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase
      .from("reviews")
      .select("id, reviewer_id, reviewee_id, project_id, rating, created_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase
      .from("business_verifications")
      .select("id, user_id, submitted_at")
      .not("submitted_at", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase.from("business_verifications").select("id, user_id"),
    supabase
      .from("business_verification_documents")
      .select("id, verification_id, doc_type, file_name, created_at")
      .order("created_at", { ascending: false })
      .limit(QUERY_LIMIT),
    supabase.rpc("admin_recent_sign_ins", { p_limit: QUERY_LIMIT }),
  ]);

  const profiles = (profilesRes.data ?? []) as ProfileRow[];
  const profileMap = new Map<string, ProfileRow>(profiles.map((p) => [p.id, p]));

  if (!signInsRes.error && signInsRes.data) {
    const missingIds = signInsRes.data
      .map((r) => r.user_id)
      .filter((id) => !profileMap.has(id));
    if (missingIds.length > 0) {
      const { data: extraProfiles } = await supabase
        .from("profiles")
        .select("id, email, name, company_name, created_at")
        .in("id", missingIds);
      (extraProfiles ?? []).forEach((p) => profileMap.set(p.id, p as ProfileRow));
    }
  }

  const roleMap = new Map<string, AppRole>();
  (rolesRes.data ?? []).forEach((r) => {
    roleMap.set(r.user_id, r.role as AppRole);
  });

  const projects = projectsRes.data ?? [];
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  const nameFor = (userId: string) => {
    const p = profileMap.get(userId);
    return p ? profileDisplayName(p) : "Unknown user";
  };

  const audienceFor = (userId: string): ActivityAudience | null => {
    const role = roleMap.get(userId);
    if (role === "student") return "student";
    if (role === "business") return "business";
    return null;
  };

  const events: AdminActivityEvent[] = [];

  for (const p of profiles) {
    const audience = audienceFor(p.id);
    if (!audience) continue;
    events.push({
      id: `account-${p.id}`,
      audience,
      userId: p.id,
      userName: profileDisplayName(p),
      description: `Created ${audience} account`,
      occurredAt: p.created_at,
      kind: "account",
    });
  }

  for (const proj of projects) {
    const audience = audienceFor(proj.business_id);
    if (!audience) continue;

    events.push({
      id: `project-post-${proj.id}`,
      audience,
      userId: proj.business_id,
      userName: nameFor(proj.business_id),
      description: `Posted project “${proj.title}”`,
      occurredAt: proj.created_at,
      kind: "project",
    });

    if (proj.status === "completed" && isAfterCreate(proj.updated_at, proj.created_at)) {
      events.push({
        id: `project-complete-${proj.id}`,
        audience,
        userId: proj.business_id,
        userName: nameFor(proj.business_id),
        description: `Marked project “${proj.title}” completed`,
        occurredAt: proj.updated_at,
        kind: "project",
      });
    }
  }

  for (const prop of proposalsRes.data ?? []) {
    const title = projectMap.get(prop.project_id)?.title ?? "a project";
    const studentAudience = audienceFor(prop.student_id);
    if (studentAudience === "student") {
      events.push({
        id: `proposal-apply-${prop.id}`,
        audience: "student",
        userId: prop.student_id,
        userName: nameFor(prop.student_id),
        description: `Applied to “${title}”`,
        occurredAt: prop.created_at,
        kind: "application",
      });
    }

    if (
      (prop.status === "accepted" || prop.status === "rejected") &&
      isAfterCreate(prop.updated_at, prop.created_at)
    ) {
      const project = projectMap.get(prop.project_id);
      const businessId = project?.business_id;
      if (businessId && audienceFor(businessId) === "business") {
        const verb = prop.status === "accepted" ? "Accepted" : "Rejected";
        events.push({
          id: `proposal-${prop.status}-${prop.id}`,
          audience: "business",
          userId: businessId,
          userName: nameFor(businessId),
          description: `${verb} application for “${title}”`,
          occurredAt: prop.updated_at,
          kind: "application",
        });
      }
    }
  }

  for (const sub of submissionsRes.data ?? []) {
    const title = projectMap.get(sub.project_id)?.title ?? "a project";
    const studentAudience = audienceFor(sub.student_id);
    if (studentAudience === "student") {
      events.push({
        id: `submission-create-${sub.id}`,
        audience: "student",
        userId: sub.student_id,
        userName: nameFor(sub.student_id),
        description: `Submitted work for “${title}”`,
        occurredAt: sub.created_at,
        kind: "submission",
      });
    }

    if (
      (sub.status === "revision_requested" || sub.status === "approved") &&
      isAfterCreate(sub.updated_at, sub.created_at)
    ) {
      const project = projectMap.get(sub.project_id);
      const businessId = project?.business_id;
      if (businessId && audienceFor(businessId) === "business") {
        const verb =
          sub.status === "approved" ? "Approved submission for" : "Requested revision on";
        events.push({
          id: `submission-${sub.status}-${sub.id}`,
          audience: "business",
          userId: businessId,
          userName: nameFor(businessId),
          description: `${verb} “${title}”`,
          occurredAt: sub.updated_at,
          kind: "submission",
        });
      }
    }
  }

  for (const rev of reviewsRes.data ?? []) {
    const title = projectMap.get(rev.project_id)?.title ?? "a project";
    const audience = audienceFor(rev.reviewer_id);
    if (!audience) continue;
    events.push({
      id: `review-${rev.id}`,
      audience,
      userId: rev.reviewer_id,
      userName: nameFor(rev.reviewer_id),
      description: `Left a ${rev.rating}-star review on “${title}”`,
      occurredAt: rev.created_at,
      kind: "review",
    });
  }

  for (const v of verificationsRes.data ?? []) {
    if (!v.submitted_at) continue;
    const audience = audienceFor(v.user_id);
    if (audience !== "business") continue;
    events.push({
      id: `verif-submit-${v.id}`,
      audience: "business",
      userId: v.user_id,
      userName: nameFor(v.user_id),
      description: "Submitted business verification for review",
      occurredAt: v.submitted_at,
      kind: "verification",
    });
  }

  const verifUserMap = new Map(
    (allVerificationsRes.data ?? []).map((v) => [v.id, v.user_id])
  );

  for (const doc of verifDocsRes.data ?? []) {
    const userId = verifUserMap.get(doc.verification_id);
    if (!userId || audienceFor(userId) !== "business") continue;
    events.push({
      id: `verif-doc-${doc.id}`,
      audience: "business",
      userId,
      userName: nameFor(userId),
      description: `Uploaded verification document (${docTypeLabel(doc.doc_type)})`,
      occurredAt: doc.created_at,
      kind: "verification",
    });
  }

  if (!signInsRes.error && signInsRes.data) {
    for (const row of signInsRes.data) {
      const audience = audienceFor(row.user_id);
      if (!audience || !row.last_sign_in_at) continue;
      events.push({
        id: `login-${row.user_id}-${row.last_sign_in_at}`,
        audience,
        userId: row.user_id,
        userName: nameFor(row.user_id) !== "Unknown user" ? nameFor(row.user_id) : row.email,
        description: "Signed in",
        occurredAt: row.last_sign_in_at,
        kind: "login",
      });
    }
  }

  events.sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

  const seen = new Set<string>();
  const deduped: AdminActivityEvent[] = [];
  for (const e of events) {
    if (seen.has(e.id)) continue;
    seen.add(e.id);
    deduped.push(e);
    if (deduped.length >= MERGE_CAP) break;
  }

  return deduped;
}

export const ACTIVITY_KIND_LABELS: Record<ActivityKind, string> = {
  account: "Account",
  project: "Projects",
  application: "Applications",
  submission: "Submissions",
  review: "Reviews",
  verification: "Verification",
  login: "Login",
};
