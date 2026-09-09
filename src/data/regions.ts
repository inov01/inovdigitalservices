import type { CurrencyCode } from "../context/AppSettings"

// ── Region-based pricing.
// Prices in the data files are a single USD base. `pppFactor` is a purchasing-power
// multiplier applied to that base BEFORE the currency conversion in fmt(), so each
// region pays a price adapted to its local purchasing power (US = 1.0 reference).
// Lower factor = cheaper. These are sensible defaults you can tune anytime.
export type RegionCode = "US" | "HT" | "CA" | "EU" | "DO" | "BR" | "AE" | "OTHER"

export interface Region {
  code: RegionCode
  label: string
  flag: string
  currency: CurrencyCode
  /** Purchasing-power multiplier vs. the US base price (1.0 = full price). */
  pppFactor: number
  /** ISO 3166-1 alpha-2 country codes that resolve to this region. */
  countries: string[]
}

export const REGIONS: Record<RegionCode, Region> = {
  US: { code: "US", label: "États-Unis", flag: "🇺🇸", currency: "USD", pppFactor: 1.0, countries: ["US"] },
  HT: { code: "HT", label: "Haïti", flag: "🇭🇹", currency: "HTG", pppFactor: 0.45, countries: ["HT"] },
  CA: { code: "CA", label: "Canada", flag: "🇨🇦", currency: "CAD", pppFactor: 1.0, countries: ["CA"] },
  EU: {
    code: "EU", label: "Europe", flag: "🇪🇺", currency: "EUR", pppFactor: 0.95,
    countries: ["FR", "DE", "IT", "ES", "PT", "BE", "NL", "LU", "AT", "IE", "FI", "GR", "SK", "SI", "EE", "LV", "LT", "MT", "CY"],
  },
  DO: { code: "DO", label: "Rép. Dominicaine", flag: "🇩🇴", currency: "DOP", pppFactor: 0.55, countries: ["DO"] },
  BR: { code: "BR", label: "Brésil", flag: "🇧🇷", currency: "BRL", pppFactor: 0.6, countries: ["BR"] },
  AE: { code: "AE", label: "Émirats", flag: "🇦🇪", currency: "AED", pppFactor: 1.0, countries: ["AE"] },
  OTHER: { code: "OTHER", label: "International", flag: "🌍", currency: "USD", pppFactor: 1.0, countries: [] },
}

// Build a fast country-code → region lookup once.
const COUNTRY_TO_REGION: Record<string, RegionCode> = (() => {
  const map: Record<string, RegionCode> = {}
  ;(Object.values(REGIONS)).forEach((r) => r.countries.forEach((cc) => { map[cc] = r.code }))
  return map
})()

/** Resolve a region from an ISO country code (falls back to OTHER). */
export function regionForCountry(cc?: string | null): RegionCode {
  if (!cc) return "OTHER"
  return COUNTRY_TO_REGION[cc.toUpperCase()] ?? "OTHER"
}
