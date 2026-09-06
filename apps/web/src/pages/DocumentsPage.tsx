import { CheckCircle2, FileText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { Select } from "../components/ui/Input";
import { toast } from "../components/ui/Toaster";
import { useAuth } from "../state/AuthContext";
import type { DocumentChecklistItem, DocumentStatus } from "../types";

const statuses: DocumentStatus[] = ["PENDING", "PREPARED", "SUBMITTED"];

export function DocumentsPage() {
  const { token } = useAuth();
  const [items, setItems] = useState<DocumentChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest<{ items: DocumentChecklistItem[] }>("/documents", { token })
      .then((response) => setItems(response.items))
      .catch((requestError) =>
        setError(requestError instanceof Error ? requestError.message : "Could not load documents")
      )
      .finally(() => setLoading(false));
  }, [token]);

  const programs = useMemo(() => {
    const grouped = new Map<string, DocumentChecklistItem[]>();
    for (const item of items) grouped.set(item.programId, [...(grouped.get(item.programId) ?? []), item]);
    return grouped;
  }, [items]);
  const submitted = items.filter((item) => item.status === "SUBMITTED").length;

  async function changeStatus(item: DocumentChecklistItem, status: DocumentStatus) {
    const previous = item.status;
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, status } : entry)));
    try {
      await apiRequest(`/documents/${item.id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status })
      });
    } catch (requestError) {
      setItems((current) =>
        current.map((entry) => (entry.id === item.id ? { ...entry, status: previous } : entry))
      );
      toast.error(requestError instanceof Error ? requestError.message : "Could not update document");
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading document checklist" />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        icon={FileText}
        title="Document checklist"
        description="Documents required for every program in your latest application strategy."
        actions={
          <Badge tone="primary">
            {submitted} of {items.length} submitted
          </Badge>
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {!items.length ? (
        <EmptyState
          icon={FileText}
          title="Build an application strategy first"
          description="Your checklist is generated from the programs you select in the strategy builder."
          action={
            <Button asChild>
              <Link to="/application-strategy">Open strategy builder</Link>
            </Button>
          }
        />
      ) : (
        [...programs.values()].map((documents) => {
          const program = documents[0].program;
          const complete = documents.filter((item) => item.status === "SUBMITTED").length;
          return (
            <Card key={program.id} className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
                <div>
                  <h2 className="font-semibold text-foreground">{program.title}</h2>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {program.university.name}, {program.university.country.name}
                  </p>
                </div>
                <span className="text-sm font-medium text-foreground-muted">
                  {complete}/{documents.length} submitted
                </span>
              </div>
              <div className="divide-y divide-border">
                {documents.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                    <CheckCircle2
                      className={`h-5 w-5 ${item.status === "SUBMITTED" ? "text-success" : "text-foreground-subtle"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs capitalize text-foreground-subtle">
                        {item.category.toLowerCase()}
                      </p>
                    </div>
                    <Select
                      aria-label={`Status for ${item.title}`}
                      value={item.status}
                      onChange={(event) => changeStatus(item, event.target.value as DocumentStatus)}
                      className="h-9 w-auto"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0) + status.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            </Card>
          );
        })
      )}
    </PageContainer>
  );
}
