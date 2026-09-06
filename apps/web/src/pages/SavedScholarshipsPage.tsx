import { useEffect, useState } from "react";
import { Bookmark, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { formatCurrency, formatDate } from "../lib/format";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { useAuth } from "../state/AuthContext";
import type { SavedScholarship } from "../types";

export function SavedScholarshipsPage() {
  const { token } = useAuth();
  const [savedScholarships, setSavedScholarships] = useState<SavedScholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!token) return;
      try {
        const response = await apiRequest<{ savedScholarships: SavedScholarship[] }>("/scholarships/saved", {
          token
        });
        setSavedScholarships(response.savedScholarships);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load saved scholarships");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading saved scholarships" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={Bookmark}
        title="Saved scholarships"
        description="Scholarships you saved from eligibility results."
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {savedScholarships.length ? (
        <section className="grid gap-4">
          {savedScholarships.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{item.scholarship.name}</h2>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {item.scholarship.country?.name ?? "Multiple countries"} · {item.scholarship.coverageType}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-foreground-muted">
                    <span className="rounded-md bg-surface-muted px-3 py-1.5">
                      Deadline: {formatDate(item.scholarship.deadline)}
                    </span>
                    <span className="rounded-md bg-surface-muted px-3 py-1.5">
                      Coverage:{" "}
                      {item.scholarship.amountUsd ? formatCurrency(item.scholarship.amountUsd) : "Varies"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/scholarships/${item.scholarship.id}`}>Details</Link>
                  </Button>
                  {item.scholarship.sourceUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={item.scholarship.sourceUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
                        Official link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Bookmark}
          title="No saved scholarships yet"
          description="Run scholarship eligibility and save the awards you want to track."
          action={
            <Button asChild>
              <Link to="/scholarships">Find scholarships</Link>
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}
