import { useEffect, useState } from "react";
import { fetchAdminActivity, type AdminActivityEvent } from "@/lib/adminActivity";

export function useAdminActivity() {
  const [events, setEvents] = useState<AdminActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminActivity();
        if (!cancelled) setEvents(data);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load activity");
          setEvents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading, error };
}
