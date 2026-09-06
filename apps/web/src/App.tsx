import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PublicLayout } from "./components/PublicLayout";
import { PageLoader } from "./components/ui/Skeleton";
import { useAuth } from "./state/AuthContext";

const LandingPage = lazy(() => import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })));
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import("./pages/ProfilePage").then((m) => ({ default: m.ProfilePage })));
const ReadinessPage = lazy(() => import("./pages/ReadinessPage").then((m) => ({ default: m.ReadinessPage })));
const MatchingPage = lazy(() => import("./pages/MatchingPage").then((m) => ({ default: m.MatchingPage })));
const ApplicationStrategyPage = lazy(() =>
  import("./pages/ApplicationStrategyPage").then((m) => ({ default: m.ApplicationStrategyPage }))
);
const ScholarshipsPage = lazy(() => import("./pages/ScholarshipsPage").then((m) => ({ default: m.ScholarshipsPage })));
const ScholarshipDetailsPage = lazy(() =>
  import("./pages/ScholarshipDetailsPage").then((m) => ({ default: m.ScholarshipDetailsPage }))
);
const SavedScholarshipsPage = lazy(() =>
  import("./pages/SavedScholarshipsPage").then((m) => ({ default: m.SavedScholarshipsPage }))
);
const DeadlinesPage = lazy(() => import("./pages/DeadlinesPage").then((m) => ({ default: m.DeadlinesPage })));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage").then((m) => ({ default: m.DocumentsPage })));
const CountriesPage = lazy(() => import("./pages/CountriesPage").then((m) => ({ default: m.CountriesPage })));
const CostCalculatorPage = lazy(() => import("./pages/CostCalculatorPage").then((m) => ({ default: m.CostCalculatorPage })));
const VisaHubPage = lazy(() => import("./pages/VisaHubPage").then((m) => ({ default: m.VisaHubPage })));
const AiAdvisorPage = lazy(() => import("./pages/AiAdvisorPage").then((m) => ({ default: m.AiAdvisorPage })));

function HomeRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return (
    <PublicLayout tone="landing">
      <LandingPage />
    </PublicLayout>
  );
}

export function App() {
  return (
    <Suspense
      fallback={
        <div className="p-8">
          <PageLoader />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={(
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          )}
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/readiness" element={<ReadinessPage />} />
          <Route path="/matches" element={<MatchingPage />} />
          <Route path="/application-strategy" element={<ApplicationStrategyPage />} />
          <Route path="/scholarships" element={<ScholarshipsPage />} />
          <Route path="/scholarships/:scholarshipId" element={<ScholarshipDetailsPage />} />
          <Route path="/saved" element={<SavedScholarshipsPage />} />
          <Route path="/deadlines" element={<DeadlinesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/countries" element={<CountriesPage />} />
          <Route path="/cost-calculator" element={<CostCalculatorPage />} />
          <Route path="/visa-hub" element={<VisaHubPage />} />
          <Route path="/advisor" element={<AiAdvisorPage />} />
        </Route>

        <Route path="/ai-advisor" element={<Navigate to="/advisor" replace />} />
        <Route path="*" element={<PublicLayout><NotFoundPage /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}
