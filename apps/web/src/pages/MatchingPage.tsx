import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Filter, RefreshCw, Search, Target, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/format";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { Input, Select } from "../components/ui/Input";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { ScoreRing } from "../components/ui/Progress";
import { toast } from "../components/ui/Toaster";
import { useAuth } from "../state/AuthContext";
import type { Country, UniversityMatch, UniversityMatchesResponse } from "../types";

type CategoryFilter = "ALL" | "SAFE" | "TARGET" | "REACH";

const categories: Array<{ value: CategoryFilter; label: string }> = [
  { value: "ALL", label: "All" },
  { value: "SAFE", label: "Safe" },
  { value: "TARGET", label: "Target" },
  { value: "REACH", label: "Reach" }
];

const categoryTone: Record<UniversityMatch["category"], React.ComponentProps<typeof Badge>["tone"]> = {
  SAFE: "success",
  TARGET: "info",
  REACH: "warning"
};

export function MatchingPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<UniversityMatch[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [country, setCountry] = useState("");
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [field, setField] = useState("");
  const [maxTuition, setMaxTuition] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      if (!token) return;
      try {
        const [matchResponse, countryResponse] = await Promise.all([
          apiRequest<UniversityMatchesResponse>("/matches/universities", { token }),
          apiRequest<{ countries: Country[] }>("/catalog/countries", { token })
        ]);
        setCountryOptions(countryResponse.countries.map((item) => item.name));
        if (matchResponse.universityMatches.length) {
          setMatches(matchResponse.universityMatches);
        } else {
          await generateMatches(false);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load university matches");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const countryMatch = country
        ? match.program.university.country.name.toLowerCase().includes(country.toLowerCase())
        : true;
      const fieldMatch = field ? match.program.field.toLowerCase().includes(field.toLowerCase()) : true;
      const tuitionMatch = maxTuition ? match.program.tuitionUsd <= Number(maxTuition) : true;
      const categoryMatch = category === "ALL" ? true : match.category === category;
      return countryMatch && fieldMatch && tuitionMatch && categoryMatch;
    });
  }, [category, country, field, matches, maxTuition]);

  const counts = useMemo(
    () => ({
      ALL: matches.length,
      SAFE: matches.filter((match) => match.category === "SAFE").length,
      TARGET: matches.filter((match) => match.category === "TARGET").length,
      REACH: matches.filter((match) => match.category === "REACH").length
    }),
    [matches]
  );

  async function generateMatches(notify = true) {
    setGenerating(true);
    setError("");
    try {
      const response = await apiRequest<UniversityMatchesResponse>("/matches/universities/generate", {
        method: "POST",
        token
      });
      setMatches(response.universityMatches);
      if (notify) toast.success("University matches generated");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not generate university matches");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading university matches" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={Search}
        title="University matching"
        description="Programs grouped by fit — requirements, budget, country preference, and readiness."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/application-strategy">
                <ClipboardList className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                Build plan
              </Link>
            </Button>
            <Button onClick={() => generateMatches()} loading={generating}>
              {!generating && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Regenerate
            </Button>
          </>
        }
      />

      {error && (
        <Alert tone="danger" title={error}>
          <Link to="/profile" className="font-semibold underline">
            Review profile
          </Link>
        </Alert>
      )}

      <Card className="p-5">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
          <Filter className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Filters
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <Field label="Country">
            <Select value={country} onChange={(event) => setCountry(event.target.value)}>
              <option value="">All countries</option>
              {countryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Field">
            <Input value={field} onChange={(event) => setField(event.target.value)} placeholder="Computer Science" />
          </Field>
          <Field label="Max tuition (USD)">
            <Input
              value={maxTuition}
              onChange={(event) => setMaxTuition(event.target.value)}
              type="number"
              placeholder="25000"
            />
          </Field>
          <Button
            variant="outline"
            className="self-end"
            onClick={() => {
              setCountry("");
              setField("");
              setMaxTuition("");
              setCategory("ALL");
            }}
          >
            Clear
          </Button>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              category === item.value
                ? "border-primary bg-primary-muted text-primary"
                : "border-border bg-surface text-foreground-muted hover:border-primary"
            )}
          >
            {item.label} <span className="ml-1 text-xs text-foreground-subtle">{counts[item.value]}</span>
          </button>
        ))}
      </div>

      {filteredMatches.length ? (
        <section className="grid gap-4">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Target}
          title="No university matches yet"
          description="Generate matches after completing your profile and readiness scorecard."
          action={
            <Button onClick={() => generateMatches()} loading={generating}>
              Generate matches
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}

function MatchCard({ match }: { match: UniversityMatch }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge tone={categoryTone[match.category]}>{formatCategory(match.category)}</Badge>
            <Badge>{match.program.university.rankingBand}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-foreground">{match.program.title}</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {match.program.university.name}, {match.program.university.city},{" "}
            {match.program.university.country.name}
          </p>
          <div className="mt-4 grid gap-3 text-sm text-foreground sm:grid-cols-2 lg:grid-cols-4">
            <Info label="Field" value={match.program.field} />
            <Info label="Tuition" value={formatCurrency(match.program.tuitionUsd)} />
            <Info label="Min CGPA" value={match.program.minCgpa.toFixed(2)} />
            <Info
              label="IELTS"
              value={match.program.minIelts ? match.program.minIelts.toFixed(1) : "Flexible"}
            />
          </div>
        </div>
        <ScoreRing value={match.score} />
      </div>

      <div className="mt-5 border-t border-border pt-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
          <TrendingUp className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
          Why this match
        </div>
        <ul className="grid gap-2 text-sm leading-6 text-foreground-muted lg:grid-cols-2">
          {match.reasons.slice(0, 6).map((reason) => (
            <li key={reason} className="flex gap-2 rounded-lg bg-surface-muted px-3 py-2">
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-success" strokeWidth={1.8} aria-hidden="true" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground-subtle">{label}</p>
      <p className="mt-1 font-medium text-foreground">{value}</p>
    </div>
  );
}

function formatCategory(category: UniversityMatch["category"]) {
  return category.charAt(0) + category.slice(1).toLowerCase();
}
