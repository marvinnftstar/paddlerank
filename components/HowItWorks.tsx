const steps = [
  {
    title: "Join the waitlist",
    description:
      "Share your name, email, location, skill level, and preferred play type.",
  },
  {
    title: "Help shape Version 1",
    description:
      "Your signup helps prioritize cities, player needs, and the first ranking features.",
  },
  {
    title: "Get early access",
    description:
      "Early users will be notified when PaddleRank is ready for match tracking and rankings.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-court-teal">
            How it works
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
            Simple now. Ready for bigger competition later.
          </h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-2xl border border-white/10 bg-court-ink p-5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-court-lime text-sm font-black text-court-navy">
                {index + 1}
              </div>
              <h3 className="mt-5 text-xl font-bold text-white">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {step.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
