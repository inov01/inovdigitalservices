import { describe, expect, it } from "vitest"
import { computeQuote, discountRate } from "../quoteMath"

describe("discountRate", () => {
  it.each([[0, 0], [4, 0], [5, 0.1], [9, 0.1], [10, 0.15], [25, 0.15]])("qty %i -> %f", (qty, pct) => {
    expect(discountRate(qty)).toBe(pct)
  })
})

describe("computeQuote", () => {
  it("returns zeros for an empty cart", () => {
    expect(computeQuote([])).toMatchObject({ subtotal: 0, discount: 0, total: 0, deposit: 0, balance: 0 })
  })
  it("applies no discount under 5 items; deposit is 70%", () => {
    const q = computeQuote([{ unitPrice: 100, qty: 2 }, { unitPrice: 50, qty: 1 }])
    expect(q).toMatchObject({ subtotal: 250, discount: 0, total: 250, deposit: 175, balance: 75 })
  })
  it("applies 10% from 5 items", () => {
    const q = computeQuote([{ unitPrice: 100, qty: 5 }])
    expect(q).toMatchObject({ subtotal: 500, discountPct: 0.1, discount: 50, total: 450, deposit: 315, balance: 135 })
  })
  it("applies 15% from 10 items across lines", () => {
    const q = computeQuote([{ unitPrice: 40, qty: 6 }, { unitPrice: 60, qty: 4 }])
    expect(q).toMatchObject({ subtotal: 480, discount: 72, total: 408 })
  })
  it("deposit + balance always equals total (rounding)", () => {
    const q = computeQuote([{ unitPrice: 33.33, qty: 7 }])
    expect(q.deposit + q.balance).toBe(q.total)
  })
})
