import { Bot, GraduationCap, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { OpportunityFeed } from "../components/OpportunityFeed";
import { Button } from "../components/ui/Button";
import { PageContainer } from "../components/ui/PageContainer";
import { PageHeader } from "../components/ui/PageHeader";

const quickLinks = [
  {
    title: "Ask the AI advisor",
    body: "Get answers about your options, grounded in your profile and target countries.",
    icon: Bot,
    to: "/advisor"
  },
  {
    title: "Check your readiness",
    body: "See how you stack up for top, mid, and accessible programs before applying.",
    icon: ShieldCheck,
    to: "/readiness"
  },
  {
    title: "Find scholarships",
    body: "Match against real scholarships and track the deadlines that matter.",
    icon: GraduationCap,
    to: "/scholarships"
  },
  {
    title: "Match universities",
    body: "Programs sorted into safe, target, and reach based on your profile.",
    icon: Search,
    to: "/matches"
  }
];

export function DashboardPage() {
  return (
    <PageContainer size="wide">
      <PageHeader
        title="Dashboard"
        description="Your profile drives everything here — matches, readiness, scholarships, and country guidance."
        actions={
          <Button asChild>
            <Link to="/matches">Find universities</Link>
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((card) => (
          <Link
            key={card.title}
            to={card.to}
            className="group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-muted text-primary">
              <card.icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-base font-semibold text-foreground">{card.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-foreground-muted">{card.body}</p>
          </Link>
        ))}
      </section>

      <OpportunityFeed />
    </PageContainer>
  );
}
