export const DEPOSIT_RATE = 0.7

export function discountRate(totalQty: number): number {
  return totalQty >= 10 ? 0.15 : totalQty >= 5 ? 0.1 : 0
}

export function computeQuote(lines: { unitPrice: number; qty: number }[]) {
  const totalQty = lines.reduce((sum, l) => sum + l.qty, 0)
  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.qty, 0)
  const discountPct = discountRate(totalQty)
  const discount = Math.round(subtotal * discountPct)
  const total = subtotal - discount
  const deposit = Math.round(total * DEPOSIT_RATE)
  return { totalQty, subtotal, discountPct, discount, total, deposit, balance: total - deposit }
}
