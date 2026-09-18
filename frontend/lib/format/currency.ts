export function formatCompactCurrency(value: number, currencySymbol = '$') {
  const absValue = Math.abs(value)
  
  // Industrial standard for Indian numbering system (Lakhs and Crores)
  // 1 Crore = 10,000,000 (1e7)
  // 1 Lakh = 100,000 (1e5)
  
  if (absValue >= 1e7) return `${currencySymbol}${(value / 1e7).toFixed(2)}Cr`
  if (absValue >= 1e5) return `${currencySymbol}${(value / 1e5).toFixed(2)}L`
  if (absValue >= 1e3) return `${currencySymbol}${(value / 1e3).toFixed(2)}K`
  
  return `${currencySymbol}${value.toFixed(2)}`
}

export function formatMarketCap(cap: number | null, currencySymbol = '$') {
  if (!cap) return 'N/A'
  return formatCompactCurrency(cap, currencySymbol)
}

export function formatValue(
  value: number | null | undefined,
  suffix = '',
  decimals = 2
) {
  if (value === null || value === undefined) return 'N/A'
  return `${value.toFixed(decimals)}${suffix}`
}
