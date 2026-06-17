const features = [
  {
    title: "Match History",
    description: "Save match results and build a clean history over time.",
  },
  {
    title: "Player Profiles",
    description: "Keep your player details and match activity in one place.",
  },
  {
    title: "Club Community",
    description: "Discover approved pickleball clubs and local playing groups.",
  },
];

export function Features() {
  return (
    <section className="px-4 pb-12 pt-1 sm:px-6 lg:px-8 lg:pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-court-ocean">
            PaddleRank essentials
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-court-teal/15 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 h-2 w-12 rounded-full bg-court-green" />
              <h3 className="text-lg font-black text-court-navy">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
