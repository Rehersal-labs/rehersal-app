import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { OnboardingFlow } from "@/components/shared/OnboardingFlow";

export default async function OnboardingPage() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) redirect("/signin");

  const session = await getSession();
  if (!session) {
    redirect("/signin");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-8">
      <OnboardingFlow />
    </div>
  );
}
