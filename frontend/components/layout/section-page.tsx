interface SectionPageProps {
  title: string
  description: string
  children: React.ReactNode
}

export function SectionPage({ title, description, children }: SectionPageProps) {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </section>
  )
}
