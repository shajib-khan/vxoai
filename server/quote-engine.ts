export function computeQuote({ items, zone, afterHours, weekend }: { items: Array<{ sku: string; qty: number }>; zone: string; afterHours: boolean; weekend: boolean }) {
  // items: [{ sku: 'A1', qty: 2 }, ...]
  // sku_rates stored in DB; this example uses a lookup
  const skuRates: { [key: string]: { base_rate: number } } = {
    'A1': { base_rate: 100 },
    'A2': { base_rate: 250 }
  }

  let lineItems = []
  let subtotal = 0

  for (const it of items) {
    const rate = skuRates[it.sku].base_rate
    let itemTotal = rate * it.qty

    // zone multiplier example
    if (zone === 'remote') itemTotal *= 1.15
    if (afterHours) itemTotal *= 1.25
    if (weekend) itemTotal *= 1.1

    lineItems.push({ sku: it.sku, qty: it.qty, unit: rate, total: itemTotal })
    subtotal += itemTotal
  }

  const surcharges = 25
  const total = subtotal + surcharges
  return { lineItems, subtotal, surcharges, total }
}