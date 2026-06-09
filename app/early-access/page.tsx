import Image from "next/image";
import Link from "next/link";

export default function EarlyAccessPage() {
  return (
    <main className="min-h-screen bg-court-mist px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col items-center justify-center text-center">
        <Link href="/" className="mb-6 flex flex-col items-center">
          <Image
            src="/PaddleRank.png"
            alt="PaddleRank logo"
            width={56}
            height={56}
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

        <section className="w-full rounded-3xl border border-court-teal/20 bg-white p-5 shadow-glow sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-court-ocean">
            Early access
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-court-navy">
            You're on the waitlist. PaddleRank early access is opening soon.
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-court-mint px-6 py-3 text-sm font-black text-white transition hover:bg-court-ocean"
          >
            Back to homepage
          </Link>
        </section>
      </div>
    </main>
  );
}
