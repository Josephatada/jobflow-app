import { SummaryClient } from "@/components/summary/SummaryClient";
import { getApplicationsForUser } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export default async function SummaryPage() {
  const user = await requireUser();
  const applications = await getApplicationsForUser(user.id);
  return <SummaryClient applications={applications} />;
}
