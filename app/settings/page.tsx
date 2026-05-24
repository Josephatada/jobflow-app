import { SettingsClient } from "@/components/settings/SettingsClient";
import { getSettingsForUser } from "@/lib/data";
import { requireUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettingsForUser(user.id);
  return <SettingsClient settings={settings} email={user.email ?? "Signed in"} />;
}
