'use client'

import Aurora from '@/components/Aurora'

export function AppBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 opacity-40">
        <Aurora
          colorStops={['#0d9488', '#34d399', '#059669']}
          amplitude={0.8}
          blend={0.6}
          speed={0.5}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background" />
    </div>
  )
}
