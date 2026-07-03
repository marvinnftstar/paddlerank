import Image from "next/image";
import Link from "next/link";
import { LandingFeatureNav } from "@/components/LandingFeatureNav";

export function Hero() {
  return (
    <section className="bg-[#f7f8f3] px-4 pb-8 sm:px-6 lg:px-8 lg:pb-14">
      <div className="mx-auto max-w-7xl">
        <header className="flex min-h-20 items-center justify-between gap-2 py-3 sm:gap-4">
          <a href="#" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
            <Image
              src="/PaddleRank.png"
              alt="PaddleRank logo"
              width={48}
              height={48}
              priority
              className="h-10 w-10 rounded-xl object-contain"
            />
            <div>
              <p className="text-base font-black leading-none tracking-tight text-[#102c27] sm:text-lg">
                PaddleRank
              </p>
              <p className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.17em] text-slate-500 sm:block">
                Track. Compete. Rank Up.
              </p>
            </div>
          </a>

          <div className="hidden lg:block">
            <LandingFeatureNav />
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full px-2 text-sm font-extrabold text-[#102c27] transition hover:bg-[#e9ede5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102c27] sm:px-4"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-full bg-[#102c27] px-4 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#1c4940] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#102c27] focus-visible:ring-offset-2 sm:px-5"
            >
              Get Started
            </Link>
          </div>
        </header>

        <div className="mb-4 lg:hidden">
          <LandingFeatureNav />
        </div>

        <div className="relative isolate overflow-hidden rounded-[2rem] bg-[#143d35] px-5 py-7 text-white shadow-[0_30px_80px_rgba(15,45,40,0.18)] sm:px-10 sm:py-10 lg:rounded-[2.75rem] lg:px-16 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_16%,rgba(205,244,93,0.22),transparent_26%),linear-gradient(105deg,rgba(5,28,25,0.97)_0%,rgba(10,44,38,0.85)_48%,rgba(12,56,47,0.72)_100%)]" />
          <div className="absolute -right-32 top-20 h-[520px] w-[520px] rotate-[-12deg] rounded-[5rem] border-[3px] border-white/25 sm:right-[-5rem] lg:right-6 lg:h-[600px] lg:w-[600px]">
            <div className="absolute left-1/2 top-0 h-full w-px bg-white/25" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-white/25" />
            <div className="absolute left-[22%] top-[25%] h-1/2 w-[56%] border border-[#d6f55b]/35" />
          </div>
          <div className="absolute bottom-[-7rem] right-[8%] h-72 w-72 rounded-full border-[44px] border-[#d6f55b]/15 sm:h-96 sm:w-96" />
          <div className="absolute right-[18%] top-[22%] hidden h-32 w-32 rounded-full bg-[#d6f55b] shadow-[0_25px_70px_rgba(214,245,91,0.25)] sm:block">
            <span className="absolute left-5 top-11 h-2 w-2 rounded-full bg-[#143d35]/45" />
            <span className="absolute right-7 top-7 h-2 w-2 rounded-full bg-[#143d35]/45" />
            <span className="absolute bottom-7 left-12 h-2 w-2 rounded-full bg-[#143d35]/45" />
          </div>

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center">
            <div className="relative aspect-video w-full max-w-3xl overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#0b2b25] shadow-[0_24px_70px_rgba(0,0,0,0.28)] sm:rounded-[2rem]">
              <Image
                src="/hero-pickelball.png"
                alt="Pickleball paddles and balls resting beside a court net"
                fill
                priority
                sizes="(max-width: 640px) calc(100vw - 72px), (max-width: 1024px) 75vw, 768px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,45,38,0.08)_35%,rgba(6,35,30,0.5)_100%)]" />
            </div>

            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#d6f55b] backdrop-blur sm:mt-7">
              <span className="h-2 w-2 rounded-full bg-[#d6f55b]" />
              Built for every rally
            </p>
            <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.045em] sm:mt-6 sm:text-6xl lg:text-7xl xl:text-[5.2rem]">
              Your game. Your community.{" "}
              <span className="text-[#d6f55b]">Your progress.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/78 sm:text-lg sm:leading-8">
              Track trusted match results, grow with your club, and build a
              pickleball story that gets stronger every time you play.
            </p>

            <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:w-auto sm:max-w-none sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-h-13 items-center justify-center rounded-full bg-[#d6f55b] px-8 py-4 text-base font-black text-[#102c27] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#143d35]"
              >
                Get Started
                <span aria-hidden="true" className="ml-2">
                  ↗
                </span>
              </Link>
              <a
                href="#club-interest"
                className="inline-flex min-h-13 items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 py-4 text-base font-black text-white backdrop-blur transition hover:bg-white hover:text-[#102c27] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explore Clubs
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-semibold text-white/65 sm:text-sm">
              <span>Match history</span>
              <span aria-hidden="true" className="text-[#d6f55b]">
                ●
              </span>
              <span>Player profiles</span>
              <span aria-hidden="true" className="text-[#d6f55b]">
                ●
              </span>
              <span>Local clubs</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
