const features = [
  {
    title: "Track Matches",
    description: "Save match results and build a clean history over time.",
  },
  {
    title: "Compete on Rankings",
    description: "Get ready for player rankings across local communities.",
  },
  {
    title: "Join Tournaments Soon",
    description: "Future updates can support events, brackets, and clubs.",
  },
];

export function Features() {
  return (
    <section className="px-4 pb-12 pt-1 sm:px-6 lg:px-8 lg:pb-16">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-court-ocean">
            Small highlights
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
