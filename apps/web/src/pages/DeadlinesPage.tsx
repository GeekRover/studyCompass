import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileWarning,
  RefreshCw,
  ShieldAlert,
  XCircle,
  type LucideIcon
} from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { cn } from "../lib/cn";
import { formatDate } from "../lib/format";
import { Alert } from "../components/ui/Alert";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { Stat } from "../components/ui/Stat";
import { toast } from "../components/ui/Toaster";
import { useAuth } from "../state/AuthContext";
import type {
  MonitorAlert,
  MonitorAlertSeverity,
  MonitorAlertsResponse,
  MonitorScanResponse,
  ScholarshipDeadline
} from "../types";

const scanBody = JSON.stringify({ horizonDays: 180, criticalDays: 30 });

export function DeadlinesPage() {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<MonitorAlert[]>([]);
  const [deadlines, setDeadlines] = useState<ScholarshipDeadline[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [criticalCount, setCriticalCount] = useState(0);
  const [watchedPrograms, setWatchedPrograms] = useState(0);
  const [watchedScholarships, setWatchedScholarships] = useState(0);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [updatingAlertId, setUpdatingAlertId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadMonitor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const upcomingCount = useMemo(
    () => deadlines.filter((item) => new Date(item.deadline).getTime() >= Date.now()).length,
    [deadlines]
  );
  const deadlineAlertCount = useMemo(
    () => alerts.filter((alert) => alert.type !== "REQUIREMENT_CHANGE").length,
    [alerts]
  );
  const requirementAlertCount = useMemo(
    () => alerts.filter((alert) => alert.type === "REQUIREMENT_CHANGE").length,
    [alerts]
  );

  function applyAlertResponse(response: MonitorAlertsResponse) {
    setAlerts(response.alerts);
    setUnreadCount(response.unreadCount);
    setCriticalCount(response.criticalCount);
  }

  function applyMonitorResponse(response: MonitorScanResponse) {
    applyAlertResponse(response);
    setWatchedPrograms(response.summary.watchedPrograms);
    setWatchedScholarships(response.summary.watchedScholarships);
  }

  async function loadMonitor() {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [scanResponse, deadlineResponse] = await Promise.all([
        apiRequest<MonitorScanResponse>("/monitor/scan", { method: "POST", token, body: scanBody }),
        apiRequest<{ deadlines: ScholarshipDeadline[] }>("/scholarships/deadlines", { token })
      ]);
      applyMonitorResponse(scanResponse);
      setDeadlines(deadlineResponse.deadlines);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not run the deadline and requirement monitor"
      );
    } finally {
      setLoading(false);
    }
  }

  async function scanNow() {
    if (!token) return;
    setScanning(true);
    setError("");
    try {
      const response = await apiRequest<MonitorScanResponse>("/monitor/scan", {
        method: "POST",
        token,
        body: scanBody
      });
      applyMonitorResponse(response);
      toast.success(
        response.summary.alertsCreated
          ? `${response.summary.alertsCreated} new alert${response.summary.alertsCreated === 1 ? "" : "s"} created`
          : "Monitor scan complete"
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not run the monitor scan");
    } finally {
      setScanning(false);
    }
  }

  async function loadAlerts() {
    if (!token) return;
    applyAlertResponse(
      await apiRequest<MonitorAlertsResponse>("/monitor/alerts", { token, noCache: true })
    );
  }

  async function updateAlert(alertId: string, status: "READ" | "DISMISSED") {
    if (!token) return;
    setUpdatingAlertId(alertId);
    setError("");
    try {
      await apiRequest<{ alert: MonitorAlert }>(`/monitor/alerts/${alertId}`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ status })
      });
      await loadAlerts();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update alert");
    } finally {
      setUpdatingAlertId("");
    }
  }

  async function markAllRead() {
    if (!token) return;
    setError("");
    try {
      applyAlertResponse(
        await apiRequest<MonitorAlertsResponse>("/monitor/alerts/read-all", { method: "PATCH", token })
      );
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not mark alerts as read");
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading deadline monitor" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={Bell}
        title="Deadline & requirement monitor"
        description="Alerts for nearby application deadlines, scholarship deadlines, and admission requirement changes."
        actions={
          <>
            <Button variant="outline" onClick={markAllRead} disabled={unreadCount === 0}>
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Mark all read
            </Button>
            <Button onClick={scanNow} loading={scanning}>
              {!scanning && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
              Scan now
            </Button>
          </>
        }
      />

      {error && (
        <Alert tone="danger" title={error}>
          <div className="flex flex-wrap gap-3">
            <Link to="/profile" className="font-semibold underline">
              Review profile
            </Link>
            <Link to="/application-strategy" className="font-semibold underline">
              Review strategy
            </Link>
          </div>
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Unread alerts" value={unreadCount} icon={Bell} />
        <Stat label="Critical alerts" value={criticalCount} icon={ShieldAlert} />
        <Stat label="Programs watched" value={watchedPrograms} icon={FileWarning} />
        <Stat label="Scholarships watched" value={watchedScholarships} icon={CalendarDays} />
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <Stat label="Deadline alerts" value={deadlineAlertCount} />
        <Stat label="Requirement alerts" value={requirementAlertCount} />
        <Stat label="Tracked scholarship deadlines" value={upcomingCount} />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <p className="mt-1 text-sm text-foreground-muted">
          Unread and read alerts stay here until dismissed.
        </p>
        {alerts.length ? (
          <div className="mt-4 grid gap-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                updating={updatingAlertId === alert.id}
                onRead={() => updateAlert(alert.id, "READ")}
                onDismiss={() => updateAlert(alert.id, "DISMISSED")}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={CheckCircle2}
            title="No active alerts"
            description="The latest scan didn't find urgent deadlines or changed requirements."
          />
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Tracked scholarship deadlines</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Saved scholarship deadlines from eligibility results.
            </p>
          </div>
          <Badge tone="primary">{upcomingCount} upcoming</Badge>
        </div>

        {deadlines.length ? (
          <div className="mt-4 grid gap-4">
            {deadlines.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-muted text-primary">
                      <Clock className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {item.scholarship.country?.name ?? "Multiple countries"} · due{" "}
                        {formatDate(item.deadline)}
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">{daysUntil(item.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/scholarships/${item.scholarshipId}`}>Details</Link>
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
          </div>
        ) : (
          <EmptyState
            className="mt-4"
            icon={CalendarDays}
            title="No scholarship deadlines tracked"
            description="Saving a scholarship with a deadline automatically adds it here."
            action={
              <Button asChild>
                <Link to="/scholarships">Find scholarships</Link>
              </Button>
            }
          />
        )}
      </section>
    </PageContainer>
  );
}

const severityTone: Record<MonitorAlertSeverity, React.ComponentProps<typeof Badge>["tone"]> = {
  CRITICAL: "danger",
  WARNING: "warning",
  INFO: "neutral"
};

function AlertCard({
  alert,
  updating,
  onRead,
  onDismiss
}: {
  alert: MonitorAlert;
  updating: boolean;
  onRead: () => void;
  onDismiss: () => void;
}) {
  const Icon = getAlertIcon(alert);

  return (
    <Card
      className={cn(
        "p-5",
        alert.severity === "CRITICAL" && "border-danger/40",
        alert.severity === "WARNING" && "border-warning/40"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-foreground-muted">
            <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge tone={severityTone[alert.severity]}>{formatSeverity(alert.severity)}</Badge>
              <Badge>{formatAlertType(alert.type)}</Badge>
              <Badge tone={alert.status === "UNREAD" ? "warning" : "neutral"}>
                {formatStatus(alert.status)}
              </Badge>
            </div>
            <h3 className="text-base font-semibold text-foreground">{alert.title}</h3>
            <p className="mt-2 text-sm leading-6 text-foreground-muted">{alert.message}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-foreground-muted">
              {alert.dueDate && (
                <span className="rounded-md bg-surface-muted px-2.5 py-1">Due {formatDate(alert.dueDate)}</span>
              )}
              {alert.program?.university?.country?.name && (
                <span className="rounded-md bg-surface-muted px-2.5 py-1">
                  {alert.program.university.country.name}
                </span>
              )}
              {alert.scholarship?.country?.name && (
                <span className="rounded-md bg-surface-muted px-2.5 py-1">
                  {alert.scholarship.country.name}
                </span>
              )}
              {alert.field && (
                <span className="rounded-md bg-surface-muted px-2.5 py-1">{formatField(alert.field)}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {alert.status !== "READ" && (
            <Button variant="outline" size="sm" onClick={onRead} disabled={updating}>
              <Eye className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              Read
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={onDismiss} disabled={updating}>
            <XCircle className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
            Dismiss
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={alert.scholarshipId ? `/scholarships/${alert.scholarshipId}` : "/matches"}>
              {alert.scholarshipId ? "Details" : "Matches"}
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

function getAlertIcon(alert: MonitorAlert): LucideIcon {
  if (alert.type === "REQUIREMENT_CHANGE") return FileWarning;
  if (alert.severity === "CRITICAL") return ShieldAlert;
  return CalendarDays;
}

function daysUntil(value: string) {
  const days = Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000);
  if (days < 0) return "Deadline passed";
  if (days === 0) return "Due today";
  return `${days} days left`;
}

function formatAlertType(value: MonitorAlert["type"]) {
  if (value === "APPLICATION_DEADLINE") return "Application deadline";
  if (value === "SCHOLARSHIP_DEADLINE") return "Scholarship deadline";
  return "Requirement change";
}

function formatSeverity(value: MonitorAlertSeverity) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatStatus(value: MonitorAlert["status"]) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatField(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}
