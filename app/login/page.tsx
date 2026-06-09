import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "./LoginForm";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { checkWaitlistAccess } from "@/lib/waitlistAccess";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const access = await checkWaitlistAccess(supabase, user, "login");
      redirect(access.isApproved ? "/dashboard" : "/early-access");
    }
  }

  return (
    <main className="min-h-screen bg-court-mist px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col items-center justify-center">
        <Link href="/" className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/PaddleRank.png"
            alt="PaddleRank logo"
            width={48}
            height={48}
            priority
            className="h-14 w-14 rounded-2xl object-contain"
          />
          <div className="mt-3">
            <p className="text-xl font-black leading-none text-court-navy">
              PaddleRank
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Track. Compete. Rank Up.
            </p>
          </div>
        </Link>

        <LoginForm initialErrorMessage={params.error || ""} />
      </div>
    </main>
  );
}
