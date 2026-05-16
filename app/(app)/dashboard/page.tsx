import { requireSession } from "@/lib/auth";
import { getGreeting } from "@/lib/utils";

export default async function DashboardPage() {
  const { user } = await requireSession();
  const name = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-app p-8">
      <h1 className="font-display text-display-2 text-foreground-primary">
        {getGreeting()}, {name}
      </h1>
      <p className="mt-2 text-body text-foreground-secondary">
        Dashboard UI ships in Phase B. Foundation is ready.
      </p>
    </div>
  );
}
