import Image from "next/image";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[linear-gradient(135deg,#155A8A_0%,#0D82A7_45%,#0EA2A9_100%)] px-4 py-4 text-white sm:px-6 lg:min-h-[92vh] lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(134,218,122,0.32),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(16,191,160,0.28),transparent_36%)]" />

      <div className="relative mx-auto flex min-h-[calc(92vh-2rem)] max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-3">
            <Image
              src="/PaddleRank.png"
              alt="PaddleRank logo"
              width={56}
              height={56}
              priority
              className="h-10 w-10 rounded-xl object-contain sm:h-12 sm:w-12"
            />
            <div>
              <p className="text-lg font-black leading-none">PaddleRank</p>
              <p className="mt-1 hidden text-xs font-semibold text-white/75 sm:block">
                Track. Compete. Rank Up.
              </p>
            </div>
          </a>

          <a
            href="#waitlist"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-court-green px-5 py-2 text-sm font-black text-court-navy shadow-glow transition hover:bg-white"
          >
            Join the Waitlist
          </a>
        </header>

        <div className="mx-auto flex max-w-4xl flex-1 flex-col items-center justify-center pb-7 pt-6 text-center sm:pb-10 sm:pt-9 lg:py-10">
          <div className="rounded-[2rem] border border-white/20 bg-white/10 p-4 shadow-glow backdrop-blur">
            <Image
              src="/PaddleRank.png"
              alt="PaddleRank logo"
              width={150}
              height={150}
              priority
              className="h-20 w-20 rounded-3xl object-contain sm:h-24 sm:w-24"
            />
          </div>

          <p className="mt-4 text-sm font-bold uppercase tracking-[0.24em] text-court-green">
            PaddleRank
          </p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl lg:whitespace-nowrap lg:text-6xl xl:text-7xl">
            Track. Compete. Rank Up.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/90 sm:text-lg">
            Join the waitlist for PaddleRank, the upcoming pickleball match
            tracking and ranking platform for players across the Philippines.
          </p>

          <a
            href="#waitlist"
            className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-court-green px-8 py-4 text-base font-black text-court-navy shadow-glow transition hover:bg-white"
          >
            Join the Waitlist
          </a>
        </div>
      </div>
    </section>
  );
}
