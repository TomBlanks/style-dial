const bakes = [
  { name: "Harbour sourdough", note: "48-hour ferment, dark bake, thick crust.", price: "£5.20" },
  { name: "Seeded rye", note: "Sunflower, pumpkin and linseed. Keeps for a week.", price: "£5.80" },
  { name: "Cardamom buns", note: "Friday and Saturday only, until they're gone.", price: "£3.40" },
];

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <a href="#" className="font-heading text-h3">Harbour Loaf</a>
        <a href="#visit" className="text-small font-semibold text-accent">Open today 7am – 2pm</a>
      </header>

      <main>
        <section className="mx-auto max-w-5xl px-6 py-(--space-section)">
          <h1 className="max-w-[16ch] text-h1">Bread worth getting up early for.</h1>
          <p className="mt-(--space-gap) max-w-(--measure) text-muted">
            We're a four-person bakery on Whitstable harbour. Everything is slow-fermented, shaped by hand and baked in the morning. Come early for the buns.
          </p>
          <div className="mt-(--space-gap) flex flex-wrap gap-3">
            <a href="#order" className="rounded-(--radius) bg-accent px-6 py-3 font-semibold text-accent-fg">Order for collection</a>
            <a href="#bakes" className="rounded-(--radius) px-6 py-3 font-semibold ring-1 ring-fg/25">Today's bakes</a>
          </div>
        </section>

        <section id="bakes" className="border-t border-fg/10">
          <div className="mx-auto max-w-5xl px-6 py-(--space-section)">
            <h2 className="text-h2">Today's bakes</h2>
            <p className="mt-3 max-w-(--measure) text-muted">A short list, baked properly. It changes with the season and whatever the mill sends us.</p>
            <ul className="mt-(--space-gap) grid gap-(--space-gap) md:grid-cols-3">
              {bakes.map((b) => (
                <li key={b.name} className="rounded-(--radius) bg-surface p-(--space-gap) shadow-sm ring-1 ring-fg/5">
                  <h3 className="text-h3">{b.name}</h3>
                  <p className="mt-2 text-muted">{b.note}</p>
                  <p className="mt-3 text-small font-semibold">{b.price}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="visit" className="border-t border-fg/10">
          <div className="mx-auto max-w-5xl px-6 py-(--space-section)">
            <h2 className="text-h2">Find us</h2>
            <p className="mt-3 max-w-(--measure) text-muted">2 Harbour Street, Whitstable. Open Wednesday to Sunday, 7am until 2pm or until we sell out.</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 py-10 text-small text-muted">© Harbour Loaf</footer>
    </>
  );
}
