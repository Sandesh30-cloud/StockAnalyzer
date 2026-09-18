import type { Metadata } from 'next'
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { DisableContextMenu } from '@/components/layout/disable-context-menu'
import { WatchlistProvider } from '@/providers/watchlist-provider'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
})
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'StockAnalyzer - Compare & Analyze Stocks',
  description: 'Professional stock comparison and analysis platform with intelligent investment insights',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jakarta.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <WatchlistProvider>
          <DisableContextMenu />
          {children}
          <Toaster theme="dark" position="bottom-right" richColors />
        </WatchlistProvider>
      </body>
    </html>
  )
}
