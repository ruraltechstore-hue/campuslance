import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

function decodeOAuthError(description: string | null, fallback: string) {
  if (!description) return fallback;
  try {
    return decodeURIComponent(description.replace(/\+/g, " "));
  } catch {
    return description;
  }
}

/**
 * Handles Supabase email confirmation / OAuth redirects (PKCE code or legacy hash tokens).
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const search = new URLSearchParams(window.location.search);
    const hash =
      window.location.hash && window.location.hash.length > 1
        ? new URLSearchParams(window.location.hash.slice(1))
        : null;

    const oauthError = search.get("error") ?? hash?.get("error");
    const oauthDesc = search.get("error_description") ?? hash?.get("error_description");
    if (oauthError) {
      setError(decodeOAuthError(oauthDesc, oauthError));
      return;
    }

    (async () => {
      const code = search.get("code");

      if (code) {
        const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeErr) {
          if (!cancelled)
            setError(
              exchangeErr.message ||
                "Could not verify your session. Try opening the email link in the same browser where you signed up.",
            );
          return;
        }
      }

      const {
        data: { session },
        error: sessionErr,
      } = await supabase.auth.getSession();

      if (sessionErr) {
        if (!cancelled) setError(sessionErr.message);
        return;
      }

      if (session) {
        if (!cancelled) navigate("/dashboard", { replace: true });
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && nextSession && !cancelled) {
          subscription.unsubscribe();
          navigate("/dashboard", { replace: true });
        }
      });

      await new Promise((r) => setTimeout(r, 2000));
      subscription.unsubscribe();

      const { data: retry } = await supabase.auth.getSession();
      if (!cancelled && !retry.session) {
        setError(
          "Could not complete sign-in. Use the confirmation link on the same browser where you signed up, or log in manually.",
        );
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-destructive max-w-md mb-6">{error}</p>
        <Button asChild variant="outline">
          <Link to="/login">Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
};

export default AuthCallback;
