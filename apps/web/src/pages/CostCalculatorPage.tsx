import { useEffect, useState } from "react";
import { Calculator, PiggyBank, Plane, RefreshCw, Shield, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { cn } from "../lib/cn";
import { formatCurrency } from "../lib/format";
import { calculateCostOfDegree, getLatestCostCalculation, type FundingGapAnalysis } from "../api/fundingGap";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Checkbox } from "../components/ui/Checkbox";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { Stat } from "../components/ui/Stat";
import { useAuth } from "../state/AuthContext";
import type { UniversityMatch, UniversityMatchesResponse } from "../types";

const defaultOneOffCosts = {
  visaFeeUsd: 350,
  insuranceUsd: 800,
  applicationFeeUsd: 120,
  flightCostUsd: 1200,
  emergencyFundUsd: 2000
};

type OneOffCostKey = keyof typeof defaultOneOffCosts;

const oneOffCostFields: Array<{ key: OneOffCostKey; label: string }> = [
  { key: "visaFeeUsd", label: "Visa fee" },
  { key: "insuranceUsd", label: "Health insurance" },
  { key: "applicationFeeUsd", label: "Application fee" },
  { key: "flightCostUsd", label: "Flight cost" },
  { key: "emergencyFundUsd", label: "Emergency fund" }
];

export function CostCalculatorPage() {
  const { token } = useAuth();
  const [matches, setMatches] = useState<UniversityMatch[]>([]);
  const [selectedProgramIds, setSelectedProgramIds] = useState<string[]>([]);
  const [oneOffCosts, setOneOffCosts] = useState(defaultOneOffCosts);
  const [analysis, setAnalysis] = useState<FundingGapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      if (!token) return;
      try {
        const [matchResponse, latestResponse] = await Promise.all([
          apiRequest<UniversityMatchesResponse>("/matches/universities", { token }),
          getLatestCostCalculation(token)
        ]);
        setMatches(matchResponse.universityMatches);
        setAnalysis(latestResponse.analysis);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load your matched programs");
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [token]);

  function toggleProgram(programId: string) {
    setSelectedProgramIds((current) =>
      current.includes(programId) ? current.filter((id) => id !== programId) : [...current, programId]
    );
  }

  function handleCostChange(key: OneOffCostKey, value: string) {
    setOneOffCosts((current) => ({ ...current, [key]: Math.max(0, Number(value) || 0) }));
  }

  async function calculate() {
    if (!token || selectedProgramIds.length === 0) return;
    setCalculating(true);
    setError("");
    try {
      const response = await calculateCostOfDegree(token, { programIds: selectedProgramIds, ...oneOffCosts });
      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not calculate the cost of degree");
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading cost calculator" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={Calculator}
        title="Cost of degree calculator"
        description="Estimate the full cost of studying abroad — tuition, living, visa, insurance, flights, and an emergency fund — and adjust to build a realistic budget."
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {matches.length === 0 ? (
        <EmptyState
          icon={Calculator}
          title="No matched programs yet"
          description="Generate your university matches first, then come back to estimate the cost of each option."
          action={
            <Button asChild>
              <Link to="/matches">Find universities</Link>
            </Button>
          }
        />
      ) : (
        <>
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <Wallet className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Select programs to estimate
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {matches.map((match) => {
                const selected = selectedProgramIds.includes(match.programId);
                const program = match.program;
                return (
                  <label
                    key={match.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      selected ? "border-primary bg-primary-muted" : "border-border hover:bg-surface-muted"
                    )}
                  >
                    <Checkbox
                      checked={selected}
                      onCheckedChange={() => toggleProgram(match.programId)}
                      className="mt-0.5"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{program.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-foreground-muted">
                        {program.university.name}, {program.university.country.name} — tuition{" "}
                        {formatCurrency(program.tuitionUsd)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
              <PiggyBank className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              One-off costs (applied to every selected program)
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {oneOffCostFields.map((fieldConfig) => (
                <Field key={fieldConfig.key} label={fieldConfig.label}>
                  <Input
                    value={oneOffCosts[fieldConfig.key]}
                    onChange={(event) => handleCostChange(fieldConfig.key, event.target.value)}
                    type="number"
                    min={0}
                  />
                </Field>
              ))}
            </div>
            <Button
              className="mt-5"
              onClick={calculate}
              disabled={selectedProgramIds.length === 0}
              loading={calculating}
            >
              {!calculating && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Calculate
            </Button>
          </Card>

          {analysis && (
            <>
              <Stat
                label="Estimated total cost"
                value={formatCurrency(analysis.estimatedCostUsd)}
                icon={Shield}
              />
              <section className="grid gap-4 md:grid-cols-2">
                {analysis.items.map((item) => (
                  <Card key={item.id} className="p-4">
                    <h3 className="text-sm font-semibold leading-5 text-foreground">{item.label}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <CostLine label="Tuition" value={item.tuitionUsd} />
                      <CostLine label="Living cost (1 year)" value={item.livingCostUsd} />
                      <CostLine label="Visa fee" value={item.visaFeeUsd} />
                      <CostLine label="Insurance" value={item.insuranceUsd} />
                      <CostLine label="Application fee" value={item.applicationFeeUsd} />
                      <CostLine label="Flight cost" value={item.flightCostUsd} />
                      <CostLine label="Emergency fund" value={item.emergencyFundUsd} />
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
                        <Plane className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                        Total estimated cost
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        {formatCurrency(item.totalCostUsd)}
                      </span>
                    </div>
                  </Card>
                ))}
              </section>
            </>
          )}
        </>
      )}
    </PageContainer>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-medium text-foreground-subtle">{label}</p>
      <p className="mt-1 font-semibold text-foreground">{formatCurrency(value)}</p>
    </div>
  );
}
