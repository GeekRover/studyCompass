import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
      <p className="text-5xl font-semibold text-primary">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="mt-2 text-sm text-foreground-muted">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Button className="mt-6" asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
