import { apiRequest } from "./client";

export type VisaGuideCategory =
  | "REQUIRED_DOCUMENTS"
  | "FINANCIAL_PROOF"
  | "EMBASSY_INFO"
  | "PROCESSING_TIMELINE"
  | "VISA_FEES"
  | "COMMON_MISTAKES";

export type VisaGuideEntry = {
  id: string;
  category: VisaGuideCategory;
  categoryLabel: string;
  headline: string;
  detail: string;
  costUsd?: number | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  severity: number;
};

export type VisaGuideResponse = {
  country: { id: string; name: string };
  entries: VisaGuideEntry[];
  summary: {
    totalEntries: number;
    estimatedVisaFeeUsd: number;
    estimatedFinancialProofUsd: number;
  };
};

export function getVisaGuideForCountry(token: string, countryId: string): Promise<VisaGuideResponse> {
  return apiRequest<VisaGuideResponse>(`/visa-guide/country/${countryId}`, {
    token
  });
}
