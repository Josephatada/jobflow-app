import { KanbanBoard } from "@/components/board/KanbanBoard";
import { getActiveGhostSnoozeIds, getApplicationsForUser, getSettingsForUser } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const user = await requireUser();
  const [applications, settings, snoozedApplicationIds] = await Promise.all([
    getApplicationsForUser(user.id),
    getSettingsForUser(user.id),
    getActiveGhostSnoozeIds(user.id),
  ]);

  return (
    <KanbanBoard
      initialApplications={applications}
      settings={settings}
      snoozedApplicationIds={snoozedApplicationIds}
    />
  );
}
