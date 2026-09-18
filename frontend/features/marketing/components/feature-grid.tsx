'use client'

import AnimatedContent from '@/components/animations/AnimatedContent'
import SpotlightCard from '@/components/animations/SpotlightCard'
import { FEATURE_CARDS, WORKFLOW_STEPS } from '@/features/marketing/constants'

export function FeatureGrid() {
  return (
    <AnimatedContent distance={40} duration={0.75} threshold={0.15}>
      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURE_CARDS.map((feature) => {
            const Icon = feature.icon
            return (
              <SpotlightCard
                key={feature.title}
                className="p-0"
                spotlightColor="rgba(52, 211, 153, 0.08)"
              >
                <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5">
                  <div className="mb-4 inline-flex rounded-2xl border border-primary/20 bg-primary/10 p-3 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            )
          })}
        </div>

        <SpotlightCard className="p-0" spotlightColor="rgba(52, 211, 153, 0.08)">
          <div className="h-full rounded-[inherit] border border-border/40 bg-card/35 p-5 sm:p-6">
            <p className="text-sm font-medium text-primary">How the workflow unfolds</p>
            <div className="mt-4 space-y-5">
              {WORKFLOW_STEPS.map((step, index) => (
                <div key={step.title} className="flex gap-4">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>
      </section>
    </AnimatedContent>
  )
}
