import { type VisaCategory, Prisma } from "@prisma/client";
import type { VisaGuideCreateInput } from "@study-abroad/shared";
import { prisma } from "../lib/prisma.js";

/**
 * Module 4 · Feature 3 — Visa Preparation Hub
 *
 * Country-specific visa guidance — required documents, financial proof,
 * embassy links, processing timeline, visa fees and common mistakes —
 * curated by Content Managers and read by Students.
 *
 * Students read only PUBLISHED entries. Content Managers / Admins can create
 * new entries (published or as drafts pending review).
 */

export class VisaGuideError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "VisaGuideError";
  }
}

const visaGuideSelect = {
  id: true,
  category: true,
  headline: true,
  detail: true,
  costUsd: true,
  sourceLabel: true,
  sourceUrl: true,
  severity: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.VisaGuideSelect;

// Human-friendly labels used when grouping entries by category.
const CATEGORY_LABELS: Record<VisaCategory, string> = {
  REQUIRED_DOCUMENTS: "Required documents",
  FINANCIAL_PROOF: "Financial proof",
  EMBASSY_INFO: "Embassy info",
  PROCESSING_TIMELINE: "Processing timeline",
  VISA_FEES: "Visa fees",
  COMMON_MISTAKES: "Common mistakes"
};

/**
 * Visa guidance for a single country. Students only ever see published
 * entries; content managers / admins can pass includeUnpublished to review
 * drafts.
 */
export async function getVisaGuideForCountry(
  countryId: string,
  options: { includeUnpublished?: boolean } = {}
) {
  const country = await prisma.country.findUnique({
    where: { id: countryId },
    select: { id: true, name: true }
  });

  if (!country) {
    throw new VisaGuideError("Country not found", 404);
  }

  const entries = await prisma.visaGuide.findMany({
    where: {
      countryId,
      ...(options.includeUnpublished ? {} : { isPublished: true })
    },
    select: visaGuideSelect,
    orderBy: [{ category: "asc" }, { severity: "desc" }]
  });

  const estimatedVisaFeeUsd = entries
    .filter((entry) => entry.category === "VISA_FEES")
    .reduce((sum, entry) => sum + (entry.costUsd ?? 0), 0);
  const estimatedFinancialProofUsd = entries
    .filter((entry) => entry.category === "FINANCIAL_PROOF")
    .reduce((sum, entry) => sum + (entry.costUsd ?? 0), 0);

  return {
    country,
    entries: entries.map((entry) => ({
      ...entry,
      categoryLabel: CATEGORY_LABELS[entry.category]
    })),
    summary: {
      totalEntries: entries.length,
      estimatedVisaFeeUsd,
      estimatedFinancialProofUsd
    }
  };
}

/**
 * Content Manager / Admin: publish a new visa-guidance entry for a country.
 */
export async function createVisaGuide(input: VisaGuideCreateInput) {
  const country = await prisma.country.findUnique({
    where: { id: input.countryId },
    select: { id: true }
  });

  if (!country) {
    throw new VisaGuideError("Country not found", 404);
  }

  return prisma.visaGuide.create({
    data: {
      countryId: input.countryId,
      category: input.category,
      headline: input.headline,
      detail: input.detail,
      costUsd: input.costUsd ?? null,
      sourceLabel: input.sourceLabel ?? null,
      sourceUrl: input.sourceUrl ?? null,
      severity: input.severity,
      isPublished: input.isPublished ?? false
    },
    select: { ...visaGuideSelect, countryId: true }
  });
}
