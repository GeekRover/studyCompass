import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/EmptyState";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";
import { PageLoader } from "../components/ui/Skeleton";
import { Progress, ScoreRing } from "../components/ui/Progress";
import { toast } from "../components/ui/Toaster";
import { useAuth } from "../state/AuthContext";
import type { ReadinessResponse, ReadinessScore } from "../types";

const tierOrder = ["Top-tier", "Mid-tier", "Accessible-tier"];

export function ReadinessPage() {
  const { token } = useAuth();
  const [scores, setScores] = useState<ReadinessScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadScores() {
      if (!token) return;
      try {
        const response = await apiRequest<ReadinessResponse>("/readiness/latest", { token });
        setScores(sortScores(response.readinessScores));
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Could not load readiness scores");
      } finally {
        setLoading(false);
      }
    }
    loadScores();
  }, [token]);

  const lastGenerated = useMemo(() => {
    if (!scores.length) return null;
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(scores[0].createdAt)
    );
  }, [scores]);

  async function generateScores() {
    setGenerating(true);
    setError("");
    try {
      const response = await apiRequest<ReadinessResponse>("/readiness/generate", { method: "POST", token });
      setScores(sortScores(response.readinessScores));
      toast.success("Readiness scorecard generated");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not generate readiness scorecard");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <PageLoader label="Loading scorecard" />
      </PageContainer>
    );
  }

  return (
    <PageContainer size="wide">
      <PageHeader
        icon={ShieldCheck}
        title="Readiness scorecard"
        description="Where you stand for top, mid, and accessible programs — scored on academics, English, research, experience, and budget."
        actions={
          <Button onClick={generateScores} loading={generating}>
            {!generating && <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            Regenerate
          </Button>
        }
      />

      {lastGenerated && <p className="text-sm text-foreground-subtle">Last generated: {lastGenerated}</p>}

      {error && (
        <Alert tone="danger" title={error}>
          <Link to="/profile" className="font-semibold underline">
            Review profile
          </Link>
        </Alert>
      )}

      {scores.length ? (
        <section className="grid gap-4 lg:grid-cols-3">
          {scores.map((score) => (
            <ScoreCard key={score.id} score={score} />
          ))}
        </section>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="No scorecard yet"
          description="Generate a scorecard once your student profile is complete."
          action={
            <Button onClick={generateScores} loading={generating}>
              Generate scorecard
            </Button>
          }
        />
      )}
    </PageContainer>
  );
}

function ScoreCard({ score }: { score: ReadinessScore }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{score.tier}</h2>
          <p className="mt-1 text-sm text-foreground-subtle">Readiness score</p>
        </div>
        <ScoreRing value={score.score} />
      </div>
      <Progress value={score.score} className="mb-5" />
      <ScoreList title="Strengths" tone="positive" items={score.strengths} />
      <ScoreList title="Weaknesses" tone="warning" items={score.weaknesses} />
      <ScoreList title="Recommendations" tone="neutral" items={score.recommendations} />
    </Card>
  );
}

function ScoreList({
  title,
  items,
  tone
}: {
  title: string;
  items: string[];
  tone: "positive" | "warning" | "neutral";
}) {
  const Icon = tone === "positive" ? CheckCircle2 : tone === "warning" ? AlertTriangle : Sparkles;
  const color = tone === "positive" ? "text-success" : tone === "warning" ? "text-warning" : "text-info";

  if (!items.length) return null;

  return (
    <div className="mt-4">
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${color}`}>
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span>{title}</span>
      </div>
      <ul className="space-y-2 text-sm leading-6 text-foreground-muted">
        {items.map((item) => (
          <li key={item} className="rounded-md bg-surface-muted px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function sortScores(scores: ReadinessScore[]) {
  return [...scores].sort((left, right) => tierOrder.indexOf(left.tier) - tierOrder.indexOf(right.tier));
}
