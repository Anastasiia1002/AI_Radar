export function HomePage() {
  return (
    <div className="shell-container py-16 sm:py-20">
      <p className="font-mono text-xs tracking-[0.16em] text-accent uppercase">Discovery</p>
      <h1 className="font-display mt-4 max-w-2xl text-4xl leading-[1.08] font-medium sm:text-6xl">
        Find the AI tools you didn't know existed.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-muted">
        Search and explore AI websites across a live index of thousands of products.
      </p>
      <section id="niches" className="mt-20 border-t border-line pt-8" aria-labelledby="niches-heading">
        <h2 id="niches-heading" className="text-lg font-semibold">
          Niches
        </h2>
        <p className="mt-2 max-w-lg text-muted">Category browsing for the AI index will appear in this section.</p>
      </section>
    </div>
  )
}
