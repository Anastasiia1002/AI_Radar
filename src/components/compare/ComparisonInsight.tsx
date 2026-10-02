const INSIGHTS = [
  {
    title: 'Category overlap',
    copy: 'See whether two products appear in the same AI categories.',
  },
  {
    title: 'Index history',
    copy: 'Compare when each site was first seen and when it was most recently confirmed live.',
  },
  {
    title: 'Technical signals',
    copy: 'See which technology signals are available in the index.',
  },
]

export function ComparisonInsight() {
  return (
    <section className="mt-16 border-t border-line pt-8" aria-labelledby="learn-heading">
      <h2 id="learn-heading" className="text-lg font-semibold">
        What this comparison can tell you
      </h2>
      <ul className="mt-5 grid gap-3 md:grid-cols-3">
        {INSIGHTS.map((insight) => (
          <li key={insight.title} className="rounded-card border border-line bg-surface p-4">
            <h3 className="font-semibold">{insight.title}</h3>
            <p className="mt-2 text-sm text-muted">{insight.copy}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
