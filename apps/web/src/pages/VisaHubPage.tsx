import { useEffect, useState } from "react";
import { AlertTriangle, Clock, FileText, Landmark, Plane, Receipt, Wallet } from "lucide-react";
import { apiRequest } from "../api/client";
import { formatCurrency } from "../lib/format";
import {
  getVisaGuideForCountry,
  type VisaGuideCategory,
  type VisaGuideEntry,
  type VisaGuideResponse
} from "../api/visaGuide";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { Field } from "../components/ui/Field";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader, Skeleton } from "../components/ui/Skeleton";
import { Select } from "../components/ui/Input";
import { useAuth } from "../state/AuthContext";
import type { Country } from "../types";

const categoryOrder: Array<{ category: VisaGuideCategory; label: string; icon: React.ElementType }> = [
  { category: "REQUIRED_DOCUMENTS", label: "Required documents", icon: FileText },
  { category: "FINANCIAL_PROOF", label: "Financial proof", icon: Wallet },
  { category: "EMBASSY_INFO", label: "Embassy info", icon: Landmark },
  { category: "PROCESSING_TIMELINE", label: "Processing timeline", icon: Clock },
  { category: "VISA_FEES", label: "Visa fees", icon: Receipt },
  { category: "COMMON_MISTAKES", label: "Common mistakes", icon: AlertTriangle }
];

export function VisaHubPage() {
  const { token } = useAuth();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [guide, setGuide] = useState<VisaGuideResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingGuide, setLoadingGuide] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCountries() {
      if (!token) return;
      try {
        const response = await apiRequest<{ countries: Country[] }>("/catalog/countries", { token });
        setCountries(response.countries);
        if (response.countries.length) {
          setSelectedCountryId(response.countries[0].id);
        } else {
          setLoading(false);
        }
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load countries");
        setLoading(false);
      }
    }
    loadCountries();
  }, [token]);

  useEffect(() => {
    async function loadGuide(countryId: string) {
      if (!token) return;
      setLoadingGuide(true);
      setError("");
      try {
        setGuide(await getVisaGuideForCountry(token, countryId));
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load visa guidance");
        setGuide(null);
      } finally {
        setLoading(false);
        setLoadingGuide(false);
      }
    }
    if (selectedCountryId) loadGuide(selectedCountryId);
  }, [selectedCountryId, token]);

  const entriesByCategory = new Map<VisaGuideCategory, VisaGuideEntry[]>();
  for (const entry of guide?.entries ?? []) {
    entriesByCategory.set(entry.category, [...(entriesByCategory.get(entry.category) ?? []), entry]);
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading visa hub" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={Plane}
        title="Visa preparation hub"
        description="Country-specific visa guidance — documents, financial proof, embassy links, timelines, fees, and common mistakes."
        actions={
          <Field label="Country" className="w-56">
            <Select value={selectedCountryId} onChange={(event) => setSelectedCountryId(event.target.value)}>
              {countries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
                </option>
              ))}
            </Select>
          </Field>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {loadingGuide ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      ) : guide && guide.entries.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {categoryOrder
            .filter((section) => entriesByCategory.has(section.category))
            .map((section) => {
              const Icon = section.icon;
              const entries = entriesByCategory.get(section.category) ?? [];
              return (
                <Card key={section.category} className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-muted text-primary">
                      <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h2 className="text-base font-semibold text-foreground">{section.label}</h2>
                  </div>
                  <div className="grid gap-4">
                    {entries.map((entry) => (
                      <div key={entry.id}>
                        <p className="text-sm font-semibold text-foreground">{entry.headline}</p>
                        <p className="mt-1 text-sm leading-6 text-foreground-muted">{entry.detail}</p>
                        {entry.costUsd ? (
                          <p className="mt-2 text-sm font-semibold text-primary">
                            {formatCurrency(entry.costUsd)}
                          </p>
                        ) : null}
                        {entry.sourceUrl ? (
                          <a
                            href={entry.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-sm font-medium text-primary underline"
                          >
                            {entry.sourceLabel ?? "Learn more"}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
        </section>
      ) : (
        <EmptyState
          icon={Plane}
          title="No visa guidance yet"
          description="Visa guidance for this country isn't available yet — try Canada, Australia, Germany, the United Kingdom, or the United States."
        />
      )}
    </PageContainer>
  );
}
