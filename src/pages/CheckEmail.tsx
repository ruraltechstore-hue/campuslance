import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Layout } from "@/components/Layout";
import { toast } from "sonner";

export const PENDING_EMAIL_VERIFICATION_KEY = "pending_email_verification";
const LEGACY_OTP_EMAIL_KEY = "pending_otp_email";
const STORAGE_KEY = PENDING_EMAIL_VERIFICATION_KEY;
const RESEND_COOLDOWN = 60;

const CheckEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email =
    (location.state as { email?: string } | null)?.email ??
    sessionStorage.getItem(STORAGE_KEY) ??
    sessionStorage.getItem(LEGACY_OTP_EMAIL_KEY) ??
    "";

  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
      return;
    }
    sessionStorage.setItem(STORAGE_KEY, email);
    sessionStorage.removeItem(LEGACY_OTP_EMAIL_KEY);
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleResend() {
    if (cooldown > 0 || !email) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Verification email sent again");
    setCooldown(RESEND_COOLDOWN);
  }

  return (
    <Layout>
      <div className="container-page py-16 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Check your inbox</h1>
        <p className="text-muted-foreground mb-8">
          We sent a confirmation link to <span className="text-foreground font-medium">{email}</span>. Open the
          email and tap <strong className="text-foreground font-medium">Confirm email</strong> to activate your
          account.
        </p>

        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            After confirming, you will be signed in and taken to your dashboard. You can close this tab once you
            are done.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-foreground font-medium underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline text-left"
            >
              {resending
                ? "Resending..."
                : cooldown > 0
                  ? `Resend email in ${cooldown}s`
                  : "Resend confirmation email"}
            </button>
            <Link to="/signup" className="text-muted-foreground hover:text-foreground">
              Use a different email
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckEmail;
