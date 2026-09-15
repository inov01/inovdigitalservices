import { createContext, useContext } from "react"
import { type Lang, type Dict } from "../i18n/translations"
import { type RegionCode } from "../data/regions"

// ── Currencies. Prices in data are in USD; everything converts from USD.
export type CurrencyCode = "USD" | "HTG" | "EUR" | "CAD" | "DOP" | "BRL" | "AED"
export const CURRENCIES: Record<CurrencyCode, { label: string; symbol: string; flag: string; locale: string }> = {
  USD: { label: "Dollar US", symbol: "$US", flag: "🇺🇸", locale: "en-US" },
  HTG: { label: "Gourde", symbol: "HTG", flag: "🇭🇹", locale: "fr-HT" },
  EUR: { label: "Euro", symbol: "€", flag: "🇪🇺", locale: "fr-FR" },
  CAD: { label: "Dollar CA", symbol: "$CA", flag: "🇨🇦", locale: "fr-CA" },
  DOP: { label: "Peso DO", symbol: "RD$", flag: "🇩🇴", locale: "es-DO" },
  BRL: { label: "Real", symbol: "R$", flag: "🇧🇷", locale: "pt-BR" },
  AED: { label: "Dirham", symbol: "د.إ", flag: "🇦🇪", locale: "ar-AE" },
}
export const FALLBACK_RATES: Record<CurrencyCode, number> = { USD: 1, HTG: 132, EUR: 0.92, CAD: 1.36, DOP: 59, BRL: 5.4, AED: 3.67 }

// Default currency suggested when a visitor switches language.
export const LANG_DEFAULT_CURRENCY: Record<Lang, CurrencyCode> = {
  fr: "USD", en: "USD", es: "USD", ht: "HTG",
  pt: "BRL", it: "EUR", de: "EUR", ar: "AED",
}

// Languages that render right-to-left.
export const RTL_LANGS: Lang[] = ["ar"]

export interface AppSettings {
  lang: Lang
  setLang: (l: Lang) => void
  t: Dict
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  rates: Record<CurrencyCode, number>
  /** Convert a USD amount to the selected currency and format it. */
  fmt: (usd: number) => string
  /** Active pricing region (auto-detected, overridable). */
  region: RegionCode
  setRegion: (r: RegionCode) => void
  /** Detected ISO 3166-1 alpha-2 country of the visitor ("" until resolved). Used to preselect the phone dial code. */
  country: string
  /** Apply the region's purchasing-power factor to a USD base price (returns adjusted USD). */
  priceFor: (usd: number) => number
  /** Scale a revision window (days) by the region factor: cheaper region = shorter, pricier = longer. */
  revisionDaysFor: (days: number) => number
  /** Scale the included revision count by the region factor: cheaper region = fewer, pricier = more. */
  revisionsFor: (revisions: number) => number
}

export const Ctx = createContext<AppSettings | null>(null)

export function useSettings(): AppSettings {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("useSettings must be used within AppSettingsProvider")
  return ctx
}
