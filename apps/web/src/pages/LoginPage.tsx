import { FormEvent, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { useAuth } from "../state/AuthContext";

const demoCredentials = { email: "student@example.com", password: "Student@123" };

export function LoginPage() {
  const { login, user } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    const destination = (location.state as { from?: Location } | null)?.from?.pathname ?? "/dashboard";
    return <Navigate to={destination} replace />;
  }

  async function submit(credentials: { email: string; password: string }) {
    setError("");
    setSubmitting(true);
    try {
      await login(credentials);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    submit({ email, password });
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue planning your study abroad journey."
      footer={<>Need an account? <AuthLink to="/register" viewTransition>Create one</AuthLink></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="Email">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password">
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Button type="submit" className="w-full" loading={submitting}>
          Sign in
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={submitting}
          onClick={() => {
            setEmail(demoCredentials.email);
            setPassword(demoCredentials.password);
            submit(demoCredentials);
          }}
        >
          Try the demo account
        </Button>
      </form>
    </AuthLayout>
  );
}
