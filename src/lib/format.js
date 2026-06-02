const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const number = new Intl.NumberFormat('en-US')

export function formatValue(value, format) {
  switch (format) {
    case 'currency':
      return currency.format(value)
    case 'percent':
      return `${value}%`
    case 'number':
    default:
      return number.format(value)
  }
}

export function formatCompactCurrency(value) {
  return compactCurrency.format(value)
}

export function formatChange(change) {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change}%`
}
