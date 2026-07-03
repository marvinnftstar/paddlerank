import { ClubInterestForm } from "@/components/ClubInterestForm";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <Hero />

      <section
        id="clubs"
        className="scroll-mt-6 bg-white"
      >
        <div
          id="club-interest"
          className="mx-auto grid w-full max-w-6xl scroll-mt-24 gap-9 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14 lg:px-8 lg:py-24"
        >
          <div className="flex flex-col justify-center">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#3d6b5f]">
              Stronger together
            </p>
            <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] text-[#102c27] sm:text-5xl">
              Put your club on the pickleball map.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
              Help players find their next game, meet their next rival, and
              feel at home in a trusted local community.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#eef3e9] p-4">
                <p className="text-2xl font-black text-[#102c27]">Local</p>
                <p className="mt-1 text-sm text-slate-600">Made for PH clubs</p>
              </div>
              <div className="rounded-2xl bg-[#edf6f1] p-4">
                <p className="text-2xl font-black text-[#102c27]">Trusted</p>
                <p className="mt-1 text-sm text-slate-600">Approved listings</p>
              </div>
            </div>
          </div>

          <ClubInterestForm />
        </div>
      </section>

      <Features />
      <Footer />
    </main>
  );
}
