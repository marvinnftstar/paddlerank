const features = [
  {
    number: "01",
    title: "Track every match",
    description: "Keep a dependable record of your results and competition history.",
  },
  {
    number: "02",
    title: "See your progress",
    description: "Build your player profile and watch your pickleball story take shape.",
  },
  {
    number: "03",
    title: "Find your people",
    description: "Connect with approved clubs and local communities that love the game.",
  },
];

export function Features() {
  return (
    <section className="bg-[#f7f8f3] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#3d6b5f]">
            Play with purpose
          </p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-[-0.035em] text-[#102c27] sm:text-5xl">
            Everything your game needs to move forward.
          </h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group rounded-[1.75rem] border border-[#e1e6dd] bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl sm:p-7"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d6f55b] text-xs font-black text-[#102c27]">
                {feature.number}
              </div>
              <h3 className="mt-8 text-xl font-black tracking-tight text-[#102c27]">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
