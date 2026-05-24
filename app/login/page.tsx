import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentUser } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/board");
  const params = await searchParams;

  return (
    <main className="min-h-dvh bg-[#111110] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm bg-[#1c1b19] border border-[#2d2b27] rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] p-5">
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold mb-4">
            J
          </div>
          <h1 className="text-xl font-semibold text-[#f0ede8] tracking-tight">Sign in to JobFlow</h1>
          <p className="text-sm text-[#6b6762] mt-1">Track your pipeline from any device.</p>
        </div>
        <LoginForm next={params.next ?? "/board"} />
      </div>
    </main>
  );
}
