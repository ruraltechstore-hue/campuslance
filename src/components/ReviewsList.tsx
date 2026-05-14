import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { StarRating } from "./StarRating";
import { format } from "date-fns";

type Review = {
  id: string;
  reviewer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  project_id: string;
};

interface Props {
  userId: string;
}

export function ReviewsList({ userId }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewerNames, setReviewerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*")
        .eq("reviewee_id", userId)
        .order("created_at", { ascending: false });
      const list = (data ?? []) as Review[];
      setReviews(list);
      if (list.length) {
        const ids = Array.from(new Set(list.map((r) => r.reviewer_id)));
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, name, company_name")
          .in("id", ids);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: { id: string; company_name: string | null; name: string | null }) => {
          map[p.id] = p.company_name || p.name || "User";
        });
        setReviewerNames(map);
      }
      setLoading(false);
    })();
  }, [userId]);

  if (loading) return <p className="text-muted-foreground text-sm">Loading reviews…</p>;

  const avg =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold">
          Reviews {reviews.length > 0 && <span className="text-muted-foreground font-normal">({reviews.length})</span>}
        </h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={avg} size={16} />
            <span className="text-sm font-medium">{avg.toFixed(1)}</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No reviews yet.
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="font-medium text-sm">
                    {reviewerNames[r.reviewer_id] || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(r.created_at), "MMM d, yyyy")}
                  </div>
                </div>
                <StarRating value={r.rating} size={14} />
              </div>
              {r.comment && (
                <p className="text-sm whitespace-pre-wrap text-foreground/90">{r.comment}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
