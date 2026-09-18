'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'
import { APP_SECTIONS } from '@/lib/navigation/sections'

export function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="overflow-x-auto pb-1">
      <ul className="flex min-w-max items-center gap-1 rounded-2xl border border-border/50 bg-card/50 p-1.5 shadow-lg backdrop-blur-md">
        {APP_SECTIONS.map((section) => {
          const isActive =
            section.href === '/'
              ? pathname === '/'
              : pathname.startsWith(section.href)

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={cn(
                  'inline-flex rounded-xl px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                {section.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
