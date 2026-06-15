import { ClubInterestForm } from "@/components/ClubInterestForm";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { WaitlistForm } from "@/components/WaitlistForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-court-mist text-slate-950">
      <Hero />

      <section
        id="waitlist"
        className="scroll-mt-6 bg-court-mist"
      >
        <div className="mx-auto grid w-full max-w-6xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:px-8 lg:py-10">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-court-ocean">
              Join early access
            </p>
            <h2 className="mt-3 text-3xl font-black text-court-navy sm:text-4xl">
              Get on the PaddleRank waitlist.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              Sign up in less than a minute and be one of the first players to
              hear when early access opens.
            </p>
          </div>

          <WaitlistForm />
        </div>
      </section>

      <section
        id="clubs"
        className="scroll-mt-6 bg-white/55"
      >
        <div
          id="club-interest"
          className="mx-auto grid w-full max-w-6xl scroll-mt-6 gap-7 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8 lg:py-16"
        >
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-court-ocean">
              For clubs
            </p>
            <h2 className="mt-3 text-3xl font-black text-court-navy sm:text-4xl">
              Bring PaddleRank to Your Club
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              Register your club interest and help us build the next version of
              PaddleRank for pickleball communities. Early clubs can onboard
              up to 15 members for free during validation.
            </p>
          </div>

          <ClubInterestForm />
        </div>
      </section>

      <Features />
      <Footer />
    </main>
  );
}
