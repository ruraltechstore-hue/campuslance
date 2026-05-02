import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/Layout";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

const RESEND_COOLDOWN = 60;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email
    ?? sessionStorage.getItem("pending_otp_email")
    ?? "";

  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  useEffect(() => {
    if (!email) {
      navigate("/signup", { replace: true });
      return;
    }
    sessionStorage.setItem("pending_otp_email", email);
  }, [email, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  async function handleVerify(value: string) {
    if (value.length !== 6) return;
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: value,
      type: "signup",
    });
    setVerifying(false);
    if (error) {
      toast.error(error.message || "Invalid or expired code");
      setCode("");
      return;
    }
    sessionStorage.removeItem("pending_otp_email");
    toast.success("Email verified! Welcome to CampusLance.");
    navigate("/dashboard", { replace: true });
  }

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
    toast.success("New code sent");
    setCooldown(RESEND_COOLDOWN);
  }

  return (
    <Layout>
      <div className="container-page py-16 max-w-md">
        <h1 className="font-display text-3xl font-bold mb-2">Verify your email</h1>
        <p className="text-muted-foreground mb-8">
          We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>.
          Enter it below to activate your account.
        </p>

        <div className="space-y-6">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) handleVerify(v);
            }}
            disabled={verifying}
          >
            <InputOTPGroup>
              {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot key={i} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button
            onClick={() => handleVerify(code)}
            disabled={verifying || code.length !== 6}
            className="w-full h-11"
          >
            {verifying ? "Verifying..." : "Verify email"}
          </Button>

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="text-foreground font-medium underline-offset-4 hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {resending
                ? "Resending..."
                : cooldown > 0
                ? `Resend in ${cooldown}s`
                : "Resend code"}
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

export default VerifyOtp;
