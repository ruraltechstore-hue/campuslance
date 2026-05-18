import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search } from "lucide-react";
import { useAdminActivity } from "@/hooks/useAdminActivity";
import {
  ACTIVITY_KIND_LABELS,
  type ActivityAudience,
  type ActivityKind,
} from "@/lib/adminActivity";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type TabValue = "all" | ActivityAudience;

function ActivityList({ items }: { items: ReturnType<typeof useAdminActivity>["events"] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">No activity matches your filters.</p>
    );
  }

  return (
    <ul className="divide-y divide-border max-h-[28rem] overflow-y-auto">
      {items.map((event) => (
        <li key={event.id} className="py-3 first:pt-0 last:pb-0">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
            <span className="font-medium text-sm text-foreground">{event.userName}</span>
            <time className="text-xs text-muted-foreground tabular-nums shrink-0">
              {format(new Date(event.occurredAt), "MMM d, yyyy · h:mm a")}
            </time>
          </div>
          <p className="text-sm text-muted-foreground">{event.description}</p>
          <span className="inline-block mt-1.5 text-xs rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
            {ACTIVITY_KIND_LABELS[event.kind]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AdminActivityMonitor() {
  const { events, loading, error } = useAdminActivity();
  const [tab, setTab] = useState<TabValue>("all");
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<ActivityKind | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return events.filter((e) => {
      if (tab !== "all" && e.audience !== tab) return false;
      if (kindFilter !== "all" && e.kind !== kindFilter) return false;
      if (!q) return true;
      return (
        e.userName.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    });
  }, [events, tab, search, kindFilter]);

  const studentCount = useMemo(
    () => events.filter((e) => e.audience === "student").length,
    [events]
  );
  const businessCount = useMemo(
    () => events.filter((e) => e.audience === "business").length,
    [events]
  );

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle className="font-display text-xl">Activity monitoring</CardTitle>
        <CardDescription>
          Recent student and business actions across accounts, projects, applications, submissions,
          reviews, verification, and sign-ins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or description…"
              className="pl-9"
            />
          </div>
          <Select
            value={kindFilter}
            onValueChange={(v) => setKindFilter(v as ActivityKind | "all")}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {(Object.keys(ACTIVITY_KIND_LABELS) as ActivityKind[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {ACTIVITY_KIND_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Loading activity…</p>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({events.length})</TabsTrigger>
              <TabsTrigger value="student">Student ({studentCount})</TabsTrigger>
              <TabsTrigger value="business">Business ({businessCount})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <ActivityList items={filtered} />
            </TabsContent>
            <TabsContent value="student">
              <ActivityList items={filtered} />
            </TabsContent>
            <TabsContent value="business">
              <ActivityList items={filtered} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
