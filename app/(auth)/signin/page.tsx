import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="space-y-6 text-center">
      <h1 className="font-display text-h1 text-foreground-primary">
        Sign in to Rehearsal
      </h1>
      <p className="text-body text-foreground-secondary">
        Sign-in UI is owned by the frontend track. Auth API:{" "}
        <code className="font-mono text-small">/api/auth/callback</code>,{" "}
        <code className="font-mono text-small">/callback</code>.
      </p>
    </div>
  );
}
