import { Navigate } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { AppRole } from "@/lib/appRole";
import { supabase } from "@/integrations/supabase/client";

export function ProtectedRoute({
  children,
  requiredRole,
  requireVerifiedBusiness,
}: {
  children: ReactNode;
  requiredRole?: AppRole;
  /** When true (with business role), requires an approved business_verifications row. */
  requireVerifiedBusiness?: boolean;
}) {
  const { user, role, loading } = useAuth();
  const [kycLoading, setKycLoading] = useState(!!requireVerifiedBusiness);
  const [businessApproved, setBusinessApproved] = useState<boolean | null>(null);

  useEffect(() => {
    if (!requireVerifiedBusiness || role !== "business" || !user?.id) {
      setBusinessApproved(true);
      setKycLoading(false);
      return;
    }
    let cancelled = false;
    setKycLoading(true);
    (async () => {
      const { data } = await supabase
        .from("business_verifications")
        .select("status")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setBusinessApproved(data?.status === "approved");
        setKycLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [requireVerifiedBusiness, role, user?.id]);

  if (loading || (requireVerifiedBusiness && role === "business" && kycLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.email_confirmed_at) {
    return (
      <Navigate to="/check-email" replace state={{ email: user.email ?? "" }} />
    );
  }
  if (requiredRole && role && role !== requiredRole) return <Navigate to="/dashboard" replace />;
  if (requireVerifiedBusiness && role === "business" && businessApproved === false) {
    return <Navigate to="/business/verification" replace />;
  }
  return <>{children}</>;
}
