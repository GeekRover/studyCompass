import { useEffect, useState } from "react";
import { AlertTriangle, Calculator, PiggyBank, Plane, RefreshCw, Shield, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { calculateCostOfDegree, getLatestCostCalculation, type FundingGapAnalysis } from "../api/fundingGap";
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
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadInitialData() {
    if (!token) {
      return;
    }

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

  function toggleProgram(programId: string) {
    setSelectedProgramIds((current) => (
      current.includes(programId)
        ? current.filter((id) => id !== programId)
        : [...current, programId]
    ));
  }

  function handleCostChange(key: OneOffCostKey, value: string) {
    const nextValue = Math.max(0, Number(value) || 0);
    setOneOffCosts((current) => ({ ...current, [key]: nextValue }));
  }

  async function calculate() {
    if (!token || selectedProgramIds.length === 0) {
      return;
    }

    setCalculating(true);
    setError("");

    try {
      const response = await calculateCostOfDegree(token, {
        programIds: selectedProgramIds,
        ...oneOffCosts
      });

      setAnalysis(response.analysis);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not calculate the cost of degree");
    } finally {
      setCalculating(false);
    }
  }

  if (loading) {
    return <div className="text-sm font-medium text-[#667085]">Loading cost calculator</div>;
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="mb-5 rounded-lg border border-[#e6e9f2] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf7f2] text-[#2f6f5e]">
            <Calculator className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-[#151b2d]">Cost of Degree Calculator</h1>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              Estimate the total cost of studying abroad — tuition, living expenses, visa fee, insurance,
              application fee, flight cost, and emergency fund — and adjust the numbers to build a realistic budget.
            </p>
          </div>
        </div>
      </section>

      {error ? (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
            <p className="font-medium">{error}</p>
          </div>
        </div>
      ) : null}

      {matches.length === 0 ? (
        <section className="rounded-lg border border-dashed border-[#d6dbe8] bg-white p-8 text-center">
          <Calculator className="mx-auto h-8 w-8 text-[#2f6f5e]" strokeWidth={1.8} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-[#151b2d]">No matched programs yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">
            Generate your university matches first, then come back here to estimate the cost of each option.
          </p>
          <Link
            to="/matches"
            className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-medium text-white hover:bg-[#285f51]"
          >
            Find universities
          </Link>
        </section>
      ) : (
        <>
          <section className="mb-5 rounded-lg border border-[#e6e9f2] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#344054]">
              <Wallet className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              <span>Select programs to estimate</span>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              {matches.map((match) => {
                const selected = selectedProgramIds.includes(match.programId);
                const program = match.program;

                return (
                  <label
                    key={match.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${selected ? "border-[#2f6f5e] bg-[#edf7f2]" : "border-[#dfe4ef] bg-white hover:bg-[#f8f9fc]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleProgram(match.programId)}
                      className="mt-1 h-4 w-4 accent-[#2f6f5e]"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-[#151b2d]">{program.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[#667085]">
                        {program.university.name}, {program.university.country.name} — tuition USD {formatNumber(program.tuitionUsd)}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="mb-5 rounded-lg border border-[#e6e9f2] bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#344054]">
              <PiggyBank className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              <span>One-off costs (applied to every selected program)</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {oneOffCostFields.map((field) => (
                <CostInput
                  key={field.key}
                  label={field.label}
                  value={oneOffCosts[field.key]}
                  onChange={(value) => handleCostChange(field.key, value)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={calculate}
              disabled={calculating || selectedProgramIds.length === 0}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#2f6f5e] px-5 text-sm font-medium text-white hover:bg-[#285f51] disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${calculating ? "animate-spin" : ""}`} strokeWidth={1.8} aria-hidden="true" />
              <span>{calculating ? "Calculating" : "Calculate"}</span>
            </button>
          </section>

          {analysis ? (
            <>
              <section className="mb-5 rounded-lg border border-[#e6e9f2] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium text-[#667085]">Estimated total cost</p>
                    <p className="mt-1 text-2xl font-semibold text-[#151b2d]">USD {formatNumber(analysis.estimatedCostUsd)}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf7f2] text-[#2f6f5e]">
                    <Shield className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                  </span>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                {analysis.items.map((item) => (
                  <article key={item.id} className="rounded-lg border border-[#e6e9f2] bg-white p-4 shadow-sm">
                    <h3 className="text-sm font-semibold leading-5 text-[#151b2d]">{item.label}</h3>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#344054]">
                      <CostLine label="Tuition" value={item.tuitionUsd} />
                      <CostLine label="Living cost (1 year)" value={item.livingCostUsd} />
                      <CostLine label="Visa fee" value={item.visaFeeUsd} />
                      <CostLine label="Insurance" value={item.insuranceUsd} />
                      <CostLine label="Application fee" value={item.applicationFeeUsd} />
                      <CostLine label="Flight cost" value={item.flightCostUsd} />
                      <CostLine label="Emergency fund" value={item.emergencyFundUsd} />
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-[#edf0f6] pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[#667085]">
                        <Plane className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
                        Total estimated cost
                      </span>
                      <span className="text-sm font-semibold text-[#151b2d]">USD {formatNumber(item.totalCostUsd)}</span>
                    </div>
                  </article>
                ))}
              </section>
            </>
          ) : null}
        </>
      )}
    </div>
  );
}

function CostInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#344054]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        min={0}
        className="h-11 w-full rounded-lg border border-[#dfe4ef] bg-white px-3 text-sm font-normal text-[#344054] outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
      />
    </label>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="font-medium text-[#8b92a7]">{label}</p>
      <p className="mt-1 font-semibold text-[#27314f]">USD {formatNumber(value)}</p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}
