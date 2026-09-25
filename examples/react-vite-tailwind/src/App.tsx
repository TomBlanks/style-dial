const features = [
  { title: "Notes that stay put", body: "Every note is plain text on your own disk. No lock-in, no sync surprises, nothing to export later." },
  { title: "Sources beside your thinking", body: "Drop in a PDF or a link and quote from it without leaving the page. Citations follow the quote." },
  { title: "Quiet by design", body: "No badges, streaks or feeds. Fieldnotes opens to a blank page and gets out of the way." },
];

export default function App() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="font-heading text-h3 font-semibold">Fieldnotes</a>
        <nav className="flex gap-(--space-gap) text-small text-muted">
          <a href="#features" className="hover:text-fg">Features</a>
          <a href="#pricing" className="hover:text-fg">Pricing</a>
          <a href="#" className="hover:text-fg">Sign in</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 py-(--space-section)">
          <p className="mb-(--space-gap) text-small font-semibold uppercase tracking-widest text-accent">For researchers and writers</p>
          <h1 className="max-w-[18ch] text-h1">A calm place to think in public, slowly.</h1>
          <p className="mt-(--space-gap) max-w-(--measure) text-muted">
            Fieldnotes is a notes app for long projects: theses, books, field studies. It keeps your sources, quotes and half-formed ideas together, and stays quiet while you work.
          </p>
          <div className="mt-(--space-gap) flex flex-wrap gap-3">
            <a href="#pricing" className="rounded-(--radius) bg-accent px-6 py-3 font-semibold text-accent-fg">Start a free notebook</a>
            <a href="#features" className="rounded-(--radius) px-6 py-3 font-semibold ring-1 ring-fg/20">See how it works</a>
          </div>
        </section>

        <section id="features" className="border-t border-fg/10">
          <div className="mx-auto max-w-6xl px-6 py-(--space-section)">
            <h2 className="text-h2">Built for the long haul</h2>
            <p className="mt-3 max-w-(--measure) text-muted">Most note apps are built for quick captures. Fieldnotes is built for the months in between.</p>
            <div className="mt-(--space-gap) grid gap-(--space-gap) md:grid-cols-3">
              {features.map((f) => (
                <article key={f.title} className="rounded-(--radius) bg-surface p-(--space-gap) shadow-sm ring-1 ring-fg/5">
                  <h3 className="text-h3">{f.title}</h3>
                  <p className="mt-2 text-muted">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="border-t border-fg/10">
          <div className="mx-auto max-w-6xl px-6 py-(--space-section)">
            <h2 className="text-h2">One price, no tiers</h2>
            <p className="mt-3 max-w-(--measure) text-muted">£6 a month or £60 a year. Students and independent researchers get it free. Just email us.</p>
            <a href="#" className="mt-(--space-gap) inline-block rounded-(--radius) bg-accent px-6 py-3 font-semibold text-accent-fg">Start a free notebook</a>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10 text-small text-muted">© Fieldnotes</footer>
    </>
  );
}
