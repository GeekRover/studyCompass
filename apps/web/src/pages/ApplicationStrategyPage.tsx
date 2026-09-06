import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Lock,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Unlock
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { PageLoader } from "../components/ui/Skeleton";
import { useAuth } from "../state/AuthContext";
import type {
  ApplicationRiskTolerance,
  ApplicationStrategyItem,
  ApplicationStrategyPlan,
  ApplicationStrategyResponse
} from "../types";

type StrategyCategory = "SAFE" | "TARGET" | "REACH";
type CountKey = "safeCount" | "targetCount" | "reachCount";
type StrategyCounts = Record<CountKey, number>;

const categoryOrder: StrategyCategory[] = ["SAFE", "TARGET", "REACH"];
const countKeyByCategory: Record<StrategyCategory, CountKey> = {
  SAFE: "safeCount",
  TARGET: "targetCount",
  REACH: "reachCount"
};

const riskOptions: Array<{
  value: ApplicationRiskTolerance;
  label: string;
  description: string;
}> = [
  {
    value: "BALANCED",
    label: "Balanced",
    description: "Keeps the classic 3 Safe, 4 Target, 2 Reach mix for nine applications."
  },
  {
    value: "CONSERVATIVE",
    label: "Conservative",
    description: "Adds more Safe choices when admission certainty matters most."
  },
  {
    value: "AMBITIOUS",
    label: "Ambitious",
    description: "Adds more Reach choices while keeping a basic safety net."
  }
];

export function ApplicationStrategyPage() {
  const { token } = useAuth();
  const [plan, setPlan] = useState<ApplicationStrategyPlan | null>(null);
  const [riskTolerance, setRiskTolerance] = useState<ApplicationRiskTolerance>("BALANCED");
  const [totalApplications, setTotalApplications] = useState(9);
  const [counts, setCounts] = useState<StrategyCounts>(() => getDefaultCounts(9, "BALANCED"));
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadLatestPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const itemsByCategory = useMemo(() => {
    const grouped: Record<StrategyCategory, ApplicationStrategyItem[]> = {
      SAFE: [],
      TARGET: [],
      REACH: []
    };

    for (const item of plan?.items ?? []) {
      grouped[item.category].push(item);
    }

    return grouped;
  }, [plan]);

  const countTotal = counts.safeCount + counts.targetCount + counts.reachCount;
  const countError = countTotal < 3 || countTotal > 15;

  async function loadLatestPlan() {
    if (!token) {
      return;
    }

    try {
      const response = await apiRequest<ApplicationStrategyResponse>("/application-strategy/latest", {
        token
      });

      if (response.applicationStrategyPlan) {
        setPlan(response.applicationStrategyPlan);
        syncControlsFromPlan(response.applicationStrategyPlan);
      } else {
        await generatePlan(false);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load the application strategy");
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan(showMessage = true) {
    if (!token || countError) {
      return;
    }

    setGenerating(true);
    setError("");

    if (showMessage) {
      setMessage("");
    }

    try {
      const response = await apiRequest<ApplicationStrategyResponse>("/application-strategy/generate", {
        method: "POST",
        token,
        body: JSON.stringify({
          totalApplications,
          safeCount: counts.safeCount,
          targetCount: counts.targetCount,
          reachCount: counts.reachCount,
          riskTolerance
        })
      });

      setPlan(response.applicationStrategyPlan);

      if (showMessage) {
        setMessage("Application strategy generated");
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not generate the application strategy");
    } finally {
      setGenerating(false);
    }
  }

  async function toggleItemLock(item: ApplicationStrategyItem) {
    if (!token || !plan) {
      return;
    }

    setUpdatingItemId(item.id);
    setError("");

    try {
      const response = await apiRequest<ApplicationStrategyResponse>(`/application-strategy/${plan.id}/items`, {
        method: "PATCH",
        token,
        body: JSON.stringify({
          items: [
            {
              id: item.id,
              isLocked: !item.isLocked
            }
          ]
        })
      });

      setPlan(response.applicationStrategyPlan);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update this strategy item");
    } finally {
      setUpdatingItemId("");
    }
  }

  function syncControlsFromPlan(nextPlan: ApplicationStrategyPlan) {
    setRiskTolerance(nextPlan.riskTolerance);
    setTotalApplications(nextPlan.totalApplications);
    setCounts({
      safeCount: nextPlan.safeCount,
      targetCount: nextPlan.targetCount,
      reachCount: nextPlan.reachCount
    });
  }

  function handleRiskChange(nextRisk: ApplicationRiskTolerance) {
    const nextCounts = getDefaultCounts(totalApplications, nextRisk);

    setRiskTolerance(nextRisk);
    setCounts(nextCounts);
  }

  function handleTotalChange(value: string) {
    const nextTotal = clamp(Number(value) || 3, 3, 15);

    setTotalApplications(nextTotal);

    if (riskTolerance !== "CUSTOM") {
      setCounts(getDefaultCounts(nextTotal, riskTolerance));
    }
  }

  function handleCountChange(key: CountKey, value: string) {
    const otherTotal = Object.entries(counts).reduce((sum, [currentKey, currentValue]) => (
      currentKey === key ? sum : sum + currentValue
    ), 0);
    const nextValue = clamp(Number(value) || 0, 0, Math.max(0, 15 - otherTotal));
    const nextCounts = {
      ...counts,
      [key]: nextValue
    };

    setRiskTolerance("CUSTOM");
    setCounts(nextCounts);
    setTotalApplications(nextCounts.safeCount + nextCounts.targetCount + nextCounts.reachCount);
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl"><PageLoader label="Loading application strategy" /></div>;
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="mb-5 rounded-lg border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ClipboardList className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-[560] tracking-[-0.01em] text-foreground">Application Strategy Builder</h1>
              <p className="mt-2 text-sm leading-6 text-foreground-muted">
                Build a balanced application list from your Safe, Target, and Reach university matches.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => generatePlan()}
            disabled={generating || countError}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} strokeWidth={1.8} aria-hidden="true" />
            <span>{generating ? "Building" : "Build strategy"}</span>
          </button>
        </div>
      </section>

      {error ? (
        <div className="mb-5 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <div>
              <p className="font-medium">{error}</p>
              <div className="mt-1 flex flex-wrap gap-3">
                <Link to="/profile" className="font-medium underline">Review profile</Link>
                <Link to="/matches" className="font-medium underline">Review matches</Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {message ? (
        <div className="mb-5 rounded-lg border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
          {message}
        </div>
      ) : null}

      <section className="mb-5 rounded-lg border border-border bg-surface p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-2 text-sm font-medium text-foreground">
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          <span>Strategy settings</span>
        </div>

        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-2 text-sm font-medium text-foreground">Risk posture</p>
            <div className="grid gap-2 md:grid-cols-3">
              {riskOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleRiskChange(option.value)}
                  className={`min-h-[86px] rounded-lg border p-3 text-left transition ${riskTolerance === option.value ? "border-primary bg-primary/10" : "border-border bg-surface hover:bg-surface-muted"}`}
                >
                  <span className={`block text-sm font-semibold ${riskTolerance === option.value ? "text-primary" : "text-foreground"}`}>{option.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-foreground-muted">{option.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-4 xl:grid-cols-2">
            <NumberInput label="Total" value={totalApplications} onChange={handleTotalChange} min={3} max={15} />
            {categoryOrder.map((category) => {
              const key = countKeyByCategory[category];

              return (
                <NumberInput
                  key={category}
                  label={formatCategory(category)}
                  value={counts[key]}
                  onChange={(value) => handleCountChange(key, value)}
                  min={0}
                  max={15}
                />
              );
            })}
          </div>
        </div>

        {countError ? (
          <p className="mt-4 text-sm font-medium text-danger">Choose between 3 and 15 total applications.</p>
        ) : null}
      </section>

      {plan ? (
        <>
          <section className="mb-5 grid gap-3 md:grid-cols-4">
            <Metric label="Total applications" value={plan.totalApplications.toString()} icon={ClipboardList} />
            <Metric label="Safe" value={plan.safeCount.toString()} icon={ShieldCheck} tone="safe" />
            <Metric label="Target" value={plan.targetCount.toString()} icon={Target} tone="target" />
            <Metric label="Reach" value={plan.reachCount.toString()} icon={TrendingUp} tone="reach" />
          </section>

          <section className="mb-5 rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">{plan.summary}</p>
                <p className="mt-1 text-sm text-foreground-muted">Generated {formatDate(plan.createdAt)} using a {formatRisk(plan.riskTolerance)} strategy.</p>
              </div>
              <Link
                to="/matches"
                className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-foreground hover:bg-surface-muted"
              >
                Review matches
              </Link>
            </div>
          </section>

          {plan.warnings.length ? (
            <section className="mb-5 rounded-lg border border-warning/30 bg-warning/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-warning">
                <AlertTriangle className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                <span>Risk notes</span>
              </div>
              <ul className="grid gap-2 text-sm leading-6 text-warning md:grid-cols-2">
                {plan.warnings.map((warning) => (
                  <li key={warning} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-700" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="grid gap-5 xl:grid-cols-3">
            {categoryOrder.map((category) => (
              <StrategyColumn
                key={category}
                category={category}
                desiredCount={counts[countKeyByCategory[category]]}
                items={itemsByCategory[category]}
                updatingItemId={updatingItemId}
                onToggleLock={toggleItemLock}
              />
            ))}
          </section>
        </>
      ) : (
        <section className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-primary" strokeWidth={1.8} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">No strategy plan yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-foreground-muted">
            Generate university matches first, then build a balanced application strategy from them.
          </p>
          <button
            type="button"
            onClick={() => generatePlan()}
            disabled={generating || countError}
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-white hover:bg-primary disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} strokeWidth={1.8} aria-hidden="true" />
            <span>{generating ? "Building" : "Build strategy"}</span>
          </button>
        </section>
      )}
    </div>
  );
}

function StrategyColumn({
  category,
  desiredCount,
  items,
  updatingItemId,
  onToggleLock
}: {
  category: StrategyCategory;
  desiredCount: number;
  items: ApplicationStrategyItem[];
  updatingItemId: string;
  onToggleLock: (item: ApplicationStrategyItem) => void;
}) {
  const tone = getCategoryTone(category);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-foreground">{formatCategory(category)}</h2>
          <p className="mt-1 text-xs font-medium text-foreground-muted">{items.length} selected, {desiredCount} requested</p>
        </div>
        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${tone.badge}`}>{formatCategory(category)}</span>
      </div>

      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <StrategyItemCard
              key={item.id}
              item={item}
              updating={updatingItemId === item.id}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-surface p-5 text-sm leading-6 text-foreground-muted">
          No {formatCategory(category).toLowerCase()} programs were selected for this plan.
        </div>
      )}
    </div>
  );
}

function StrategyItemCard({
  item,
  updating,
  onToggleLock
}: {
  item: ApplicationStrategyItem;
  updating: boolean;
  onToggleLock: (item: ApplicationStrategyItem) => void;
}) {
  const tone = getCategoryTone(item.category);
  const program = item.program;

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-md px-2 py-1 text-xs font-semibold ${tone.badge}`}>#{item.rank}</span>
            <span className="rounded-md bg-surface-muted px-2 py-1 text-xs font-medium text-foreground-muted">{program.university.rankingBand}</span>
          </div>
          <h3 className="text-sm font-semibold leading-5 text-foreground">{program.title}</h3>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">
            {program.university.name}, {program.university.country.name}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleLock(item)}
          disabled={updating}
          title={item.isLocked ? "Unlock recommendation" : "Lock recommendation"}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-foreground hover:bg-surface-muted disabled:opacity-60"
        >
          {item.isLocked ? (
            <Lock className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          ) : (
            <Unlock className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-foreground">
        <Info label="Match score" value={`${item.score}/100`} />
        <Info label="Tuition" value={`USD ${formatNumber(program.tuitionUsd)}`} />
        <Info label="Deadline" value={program.deadline ? formatDate(program.deadline) : "Not listed"} />
        <Info label="Min CGPA" value={program.minCgpa.toFixed(2)} />
      </div>

      <ul className="mt-4 grid gap-2 text-xs leading-5 text-foreground-muted">
        {item.rationale.slice(0, 4).map((reason) => (
          <li key={reason} className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" strokeWidth={1.8} aria-hidden="true" />
            <span>{reason}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: "neutral" | "safe" | "target" | "reach";
}) {
  const toneClass = {
    neutral: "bg-surface-muted text-foreground",
    safe: "bg-success/10 text-success",
    target: "bg-info/10 text-info",
    reach: "bg-warning/10 text-warning"
  }[tone];

  return (
    <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-foreground-muted">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${toneClass}`}>
          <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  min,
  max
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-foreground">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        min={min}
        max={max}
        className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm font-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-[#2f6f5e]/10"
      />
    </label>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-medium text-foreground-subtle">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{value}</p>
    </div>
  );
}

function getDefaultCounts(total: number, riskTolerance: ApplicationRiskTolerance): StrategyCounts {
  const ratios = {
    CONSERVATIVE: {
      safeCount: 0.45,
      targetCount: 0.44,
      reachCount: 0.11
    },
    BALANCED: {
      safeCount: 0.34,
      targetCount: 0.44,
      reachCount: 0.22
    },
    AMBITIOUS: {
      safeCount: 0.22,
      targetCount: 0.45,
      reachCount: 0.33
    },
    CUSTOM: {
      safeCount: 0.34,
      targetCount: 0.44,
      reachCount: 0.22
    }
  }[riskTolerance];

  const rawCounts = (["safeCount", "targetCount", "reachCount"] as CountKey[]).map((key) => ({
    key,
    exact: total * ratios[key],
    count: Math.floor(total * ratios[key])
  }));

  for (const item of rawCounts) {
    if (item.count === 0 && total >= 3) {
      item.count = 1;
    }
  }

  while (sumCounts(rawCounts) > total) {
    const item = [...rawCounts]
      .filter((candidate) => candidate.count > 1)
      .sort((left, right) => right.count - left.count)[0];

    if (!item) {
      break;
    }

    item.count -= 1;
  }

  while (sumCounts(rawCounts) < total) {
    const item = [...rawCounts].sort((left, right) => {
      const rightRemainder = right.exact - Math.floor(right.exact);
      const leftRemainder = left.exact - Math.floor(left.exact);

      return rightRemainder - leftRemainder;
    })[0];

    item.count += 1;
  }

  return rawCounts.reduce((nextCounts, item) => ({
    ...nextCounts,
    [item.key]: item.count
  }), {
    safeCount: 0,
    targetCount: 0,
    reachCount: 0
  });
}

function sumCounts(counts: Array<{ count: number }>) {
  return counts.reduce((sum, item) => sum + item.count, 0);
}

function getCategoryTone(category: StrategyCategory) {
  if (category === "SAFE") {
    return {
      badge: "bg-success/10 text-success"
    };
  }

  if (category === "TARGET") {
    return {
      badge: "bg-info/10 text-info"
    };
  }

  return {
    badge: "bg-warning/10 text-warning"
  };
}

function formatCategory(category: StrategyCategory) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}

function formatRisk(riskTolerance: ApplicationRiskTolerance) {
  return riskTolerance.charAt(0) + riskTolerance.slice(1).toLowerCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}
