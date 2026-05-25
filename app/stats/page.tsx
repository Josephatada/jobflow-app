import { StatsClient } from "@/components/stats/StatsClient";
import { getApplicationsForUser } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export default async function StatsPage() {
  const user = await requireUser();
  const applications = await getApplicationsForUser(user.id);
  return <StatsClient applications={applications} />;
}
