import { ClubInterestForm } from "@/components/ClubInterestForm";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-court-mist text-slate-950">
      <Hero />

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
              Club visibility
            </p>
            <h2 className="mt-3 text-3xl font-black text-court-navy sm:text-4xl">
              Connect your club with local players.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-700">
              Share your club details and help more players discover where your
              community plays.
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
