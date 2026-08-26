import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  FileText,
  Landmark,
  Plane,
  Receipt,
  Wallet
} from "lucide-react";
import { apiRequest } from "../api/client";
import { getVisaGuideForCountry, type VisaGuideCategory, type VisaGuideEntry, type VisaGuideResponse } from "../api/visaGuide";
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
    loadCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (selectedCountryId) {
      loadGuide(selectedCountryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountryId]);

  async function loadCountries() {
    if (!token) {
      return;
    }

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

  async function loadGuide(countryId: string) {
    if (!token) {
      return;
    }

    setLoadingGuide(true);
    setError("");

    try {
      const response = await getVisaGuideForCountry(token, countryId);
      setGuide(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load visa guidance");
      setGuide(null);
    } finally {
      setLoading(false);
      setLoadingGuide(false);
    }
  }

  const entriesByCategory = new Map<VisaGuideCategory, VisaGuideEntry[]>();

  for (const entry of guide?.entries ?? []) {
    const list = entriesByCategory.get(entry.category) ?? [];
    list.push(entry);
    entriesByCategory.set(entry.category, list);
  }

  if (loading) {
    return <div className="text-sm font-medium text-[#667085]">Loading visa preparation hub</div>;
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <section className="mb-5 rounded-lg border border-[#e6e9f2] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#edf7f2] text-[#2f6f5e]">
              <Plane className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold text-[#151b2d]">Visa Preparation Hub</h1>
              <p className="mt-2 text-sm leading-6 text-[#667085]">
                Country-specific visa guidance — required documents, financial proof, embassy links,
                processing timeline, visa fees, and common mistakes — to help you prepare after an offer letter.
              </p>
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#344054]">Country</span>
            <select
              value={selectedCountryId}
              onChange={(event) => setSelectedCountryId(event.target.value)}
              className="h-11 w-full min-w-[220px] rounded-lg border border-[#dfe4ef] bg-white px-3 text-sm font-normal text-[#344054] outline-none transition focus:border-[#2f6f5e] focus:ring-2 focus:ring-[#2f6f5e]/10"
            >
              {countries.map((country) => (
                <option key={country.id} value={country.id}>{country.name}</option>
              ))}
            </select>
          </label>
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

      {loadingGuide ? (
        <div className="text-sm font-medium text-[#667085]">Loading visa guidance</div>
      ) : guide && guide.entries.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {categoryOrder
            .filter((section) => entriesByCategory.has(section.category))
            .map((section) => {
              const Icon = section.icon;
              const entries = entriesByCategory.get(section.category) ?? [];

              return (
                <article key={section.category} className="rounded-lg border border-[#e6e9f2] bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#edf7f2] text-[#2f6f5e]">
                      <Icon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h2 className="text-base font-semibold text-[#151b2d]">{section.label}</h2>
                  </div>

                  <div className="grid gap-4">
                    {entries.map((entry) => (
                      <div key={entry.id}>
                        <p className="text-sm font-semibold text-[#151b2d]">{entry.headline}</p>
                        <p className="mt-1 text-sm leading-6 text-[#667085]">{entry.detail}</p>
                        {entry.costUsd ? (
                          <p className="mt-2 text-sm font-semibold text-[#2f6f5e]">USD {formatNumber(entry.costUsd)}</p>
                        ) : null}
                        {entry.sourceUrl ? (
                          <a
                            href={entry.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-block text-sm font-medium text-[#2f6f5e] underline"
                          >
                            {entry.sourceLabel ?? "Learn more"}
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
        </section>
      ) : (
        <section className="rounded-lg border border-dashed border-[#d6dbe8] bg-white p-8 text-center">
          <Plane className="mx-auto h-8 w-8 text-[#2f6f5e]" strokeWidth={1.8} aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold text-[#151b2d]">No visa guidance yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">
            Visa guidance for this country isn't available yet — try Canada, Australia, Germany, the United Kingdom, or the United States.
          </p>
        </section>
      )}
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value);
}
