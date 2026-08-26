import { apiRequest } from "./client";

export type FundingGapItem = {
  id: string;
  programId: string;
  label: string;
  tuitionUsd: number;
  livingCostUsd: number;
  visaFeeUsd: number;
  insuranceUsd: number;
  applicationFeeUsd: number;
  flightCostUsd: number;
  emergencyFundUsd: number;
  totalCostUsd: number;
};

export type FundingGapAnalysis = {
  id: string;
  estimatedCostUsd: number;
  createdAt: string;
  items: FundingGapItem[];
};

export type CostCalculatorInput = {
  programIds: string[];
  visaFeeUsd?: number;
  insuranceUsd?: number;
  applicationFeeUsd?: number;
  flightCostUsd?: number;
  emergencyFundUsd?: number;
};

export function calculateCostOfDegree(token: string, input: CostCalculatorInput): Promise<{ analysis: FundingGapAnalysis }> {
  return apiRequest<{ analysis: FundingGapAnalysis }>("/funding-gap/analyze", {
    token,
    method: "POST",
    body: JSON.stringify(input),
    noCache: true
  });
}

export function getLatestCostCalculation(token: string): Promise<{ analysis: FundingGapAnalysis | null }> {
  return apiRequest<{ analysis: FundingGapAnalysis | null }>("/funding-gap/latest", {
    token,
    noCache: true
  });
}
