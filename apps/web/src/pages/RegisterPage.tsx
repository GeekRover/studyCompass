import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthLayout, AuthLink } from "../components/AuthLayout";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { useAuth } from "../state/AuthContext";

export function RegisterPage() {
  const { register, user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordError =
    password.length > 0 && password.length < 8 ? "Use at least 8 characters." : undefined;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (passwordError) return;
    setError("");
    setSubmitting(true);
    try {
      await register({ name, email, password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up a profile and see your university matches in minutes."
      footer={<>Already registered? <AuthLink to="/login" viewTransition>Sign in</AuthLink></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tone="danger">{error}</Alert>}
        <Field label="Name">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            type="text"
            autoComplete="name"
            required
          />
        </Field>
        <Field label="Email">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            required
          />
        </Field>
        <Field label="Password" error={passwordError} hint="At least 8 characters">
          <PasswordInput
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Button type="submit" className="w-full" loading={submitting}>
          Create account
        </Button>
      </form>
    </AuthLayout>
  );
}
