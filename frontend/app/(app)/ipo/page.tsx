'use client'

import AnimatedContent from '@/components/animations/AnimatedContent'
import { IpoAdvisor } from '@/features/ipo/components/ipo-advisor'
import { Rocket } from 'lucide-react'

export default function IpoPage() {
  return (
    <div className="space-y-16 py-6">
      <div className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <Rocket className="size-3" />
          New Listings
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-white">
          IPO Advisor
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base sm:text-lg leading-relaxed">
          Evaluate upcoming IPOs with listing gain signals, subscription demand, and valuation context for smarter entries.
        </p>
      </div>
      <div className="w-full">
        <AnimatedContent distance={50} duration={0.8} threshold={0.15}>
          <div className="bg-white/5 rounded-2xl border border-white/10 p-6 shadow-xl">
            <IpoAdvisor />
          </div>
        </AnimatedContent>
      </div>
    </div>
  )
}
