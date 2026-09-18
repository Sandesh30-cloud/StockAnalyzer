'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { swrFetcher } from '@/lib/api/client'
import { endpoints } from '@/lib/api/endpoints'
import { formatCompactCurrency } from '@/lib/format/currency'

interface FinancialsViewProps {
  symbols: string[]
}

interface FinancialData {
  symbol: string
  title: string
  currency?: string
  currencySymbol?: string
  scaleLabel?: string
  scaleDivisor?: number
  periods: string[]
  data: Array<{
    item: string
    [key: string]: string | number | null
  }>
  error?: string
}

const fetcher = swrFetcher

const formatNumber = (
  value: number | string | null,
  currencySymbol = '$',
): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'string') return value

  return formatCompactCurrency(value, currencySymbol)
}

function FinancialTable({ data }: { data: FinancialData }) {
  if (data.error) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {data.error}
      </div>
    )
  }

  if (!data.data || data.data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span>{data.title}</span>
        {data.currencySymbol && (
          <span className="rounded-md border border-border/50 bg-muted/40 px-2 py-1">
            Currency: {data.currency}
          </span>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-card min-w-[200px]">Item</TableHead>
            {data.periods.map((period) => (
              <TableHead key={period} className="text-right min-w-[120px]">
                {period}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.data.map((row, index) => (
            <TableRow key={index}>
              <TableCell className="sticky left-0 bg-card font-medium">
                {row.item}
              </TableCell>
              {data.periods.map((period) => (
                <TableCell key={period} className="text-right font-mono">
                  {formatNumber(
                    (row[`${period}Formatted`] as number | null) ?? null,
                    data.currencySymbol || '$',
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

export function FinancialsView({ symbols }: FinancialsViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0] || '')
  const [statementType, setStatementType] = useState<'income' | 'balance' | 'cashflow'>('income')

  const { data, isLoading } = useSWR<FinancialData>(
    selectedSymbol 
      ? endpoints.financials(selectedSymbol, statementType)
      : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  if (symbols.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">
            Select stocks to view financial statements
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Financial Statements</CardTitle>
            <CardDescription>
              View detailed financial data
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select stock" />
              </SelectTrigger>
              <SelectContent>
                {symbols.map((symbol) => (
                  <SelectItem key={symbol} value={symbol}>
                    {symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={statementType} onValueChange={(v) => setStatementType(v as any)}>
          <TabsList className="mb-4 w-fit">
            <TabsTrigger value="income">Income Statement</TabsTrigger>
            <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
            <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <TabsContent value="income">
                {data && <FinancialTable data={data} />}
              </TabsContent>
              <TabsContent value="balance">
                {data && <FinancialTable data={data} />}
              </TabsContent>
              <TabsContent value="cashflow">
                {data && <FinancialTable data={data} />}
              </TabsContent>
            </>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
