import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarClock,
  Globe2,
  Landmark,
  RefreshCw,
  Sparkles,
  UserRound,
  Zap,
  type LucideIcon
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatTimeAgo } from "../lib/format";
import {
  fetchOpportunityFeed,
  type OpportunityFeedItem,
  type OpportunityFeedItemType
} from "../api/opportunityFeed";
import { useAuth } from "../state/AuthContext";
import { Alert } from "./ui/Alert";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { Skeleton } from "./ui/Skeleton";

type Tone = React.ComponentProps<typeof Badge>["tone"];

const typeConfig: Record<OpportunityFeedItemType, { icon: LucideIcon; label: string; tone: Tone }> = {
  NEW_SCHOLARSHIP: { icon: Landmark, label: "Scholarship", tone: "success" },
  UPCOMING_DEADLINE: { icon: CalendarClock, label: "Deadline", tone: "warning" },
  MATCHING_UNIVERSITY: { icon: Building2, label: "University", tone: "primary" },
  VISA_UPDATE: { icon: Globe2, label: "Visa", tone: "info" },
  REQUIREMENT_CHANGE: { icon: AlertTriangle, label: "Requirement change", tone: "warning" },
  COUNTRY_INSIGHT: { icon: Globe2, label: "Country insight", tone: "info" },
  PROFILE_NUDGE: { icon: UserRound, label: "Profile", tone: "primary" },
  READINESS_ALERT: { icon: Zap, label: "Readiness", tone: "danger" }
};

const priorityLabel: Record<OpportunityFeedItem["priority"], string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low"
};

const priorityDot: Record<OpportunityFeedItem["priority"], string> = {
  HIGH: "bg-danger",
  MEDIUM: "bg-warning",
  LOW: "bg-foreground-subtle"
};

function FeedCard({ item }: { item: OpportunityFeedItem }) {
  const cfg = typeConfig[item.type];
  const Icon = cfg.icon;

  return (
    <div className="group flex gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <Badge tone={cfg.tone}>{cfg.label}</Badge>
          <span className="flex items-center gap-1 text-[11px] font-medium text-foreground-muted">
            <span className={`h-1.5 w-1.5 rounded-full ${priorityDot[item.priority]}`} />
            {priorityLabel[item.priority]}
          </span>
          <span className="ml-auto text-[11px] text-foreground-subtle">{formatTimeAgo(item.createdAt)}</span>
        </div>
        <p className="text-sm font-semibold leading-5 text-foreground">{item.title}</p>
        <p className="mt-1 text-sm leading-6 text-foreground-muted">{item.body}</p>
        {item.actionLabel && item.actionHref && (
          <Link
            to={item.actionHref}
            className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {item.actionLabel}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading opportunity feed">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

type FilterKey = "ALL" | "HIGH" | OpportunityFeedItemType;

const filterTabs: Array<{ key: FilterKey; label: string }> = [
  { key: "ALL", label: "All" },
  { key: "HIGH", label: "Urgent" },
  { key: "NEW_SCHOLARSHIP", label: "Scholarships" },
  { key: "UPCOMING_DEADLINE", label: "Deadlines" },
  { key: "MATCHING_UNIVERSITY", label: "Universities" },
  { key: "COUNTRY_INSIGHT", label: "Countries" }
];

export function OpportunityFeed() {
  const { token } = useAuth();
  const [data, setData] = useState<{
    items: OpportunityFeedItem[];
    hasProfile: boolean;
    totalCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (!token) return;
      if (!silent) setLoading(true);
      setError(null);
      try {
        const result = await fetchOpportunityFeed(token);
        setData(result);
      } catch {
        setError("Could not load your opportunity feed. Please try again.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    load();
  }, [load]);

  const filteredItems =
    data?.items.filter((item) => {
      if (activeFilter === "ALL") return true;
      if (activeFilter === "HIGH") return item.priority === "HIGH";
      return item.type === activeFilter;
    }) ?? [];

  const highCount = data?.items.filter((i) => i.priority === "HIGH").length ?? 0;

  return (
    <section aria-labelledby="feed-heading">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-muted text-primary">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          </span>
          <h2 id="feed-heading" className="text-lg font-semibold text-foreground">
            Your opportunity feed
          </h2>
          {highCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[11px] font-bold text-white">
              {highCount}
            </span>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setRefreshing(true);
            load(true);
          }}
          disabled={refreshing || loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {!loading && !error && data && data.items.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Filter opportunities">
          {filterTabs.map((tab) => {
            const count =
              tab.key === "ALL"
                ? data.items.length
                : tab.key === "HIGH"
                  ? data.items.filter((i) => i.priority === "HIGH").length
                  : data.items.filter((i) => i.type === tab.key).length;
            if (count === 0 && tab.key !== "ALL") return null;

            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={activeFilter === tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  activeFilter === tab.key
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground-muted hover:border-primary hover:text-primary"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    activeFilter === tab.key ? "bg-white/20" : "bg-surface-muted text-foreground-subtle"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <FeedSkeleton />
      ) : error ? (
        <Alert tone="danger">
          <div className="flex items-center gap-3">
            <span>{error}</span>
            <button type="button" onClick={() => load()} className="font-semibold underline">
              Retry
            </button>
          </div>
        </Alert>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={data?.hasProfile ? "You're all caught up" : "No opportunities yet"}
          description={
            data?.hasProfile
              ? "New scholarships, matches, and deadlines will show up here as they appear."
              : "Complete your profile to start seeing personalised scholarships, matches, and deadlines."
          }
          action={
            !data?.hasProfile && (
              <Button asChild>
                <Link to="/profile">Complete profile</Link>
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <FeedCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {!loading && !error && data && data.items.length > 0 && (
        <p className="mt-4 text-center text-xs text-foreground-subtle">
          Showing {filteredItems.length} of {data.totalCount} update{data.totalCount !== 1 ? "s" : ""}
        </p>
      )}
    </section>
  );
}
