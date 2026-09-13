// Single source of truth for the site's section navigation.
// Header and PageNav render the full list; Footer omits the "whyUs" anchor.
import type { Dict } from "../i18n/fr"

export interface NavItem {
  key: keyof Dict["nav"]
  /** In-page anchor href (matches the section element id). */
  href: string
  /** Section element id, without the leading "#". */
  id: string
}

// Order mirrors the on-page scroll order in `pages/Home.tsx` so PageNav's
// prev/next stepping and scroll-spy highlight track the actual funnel:
// proof (portfolio, testimonials) precedes the price, FAQ follows it.
export const NAV_ITEMS: NavItem[] = [
  { key: "home", href: "#home", id: "home" },
  { key: "services", href: "#services", id: "services" },
  { key: "portfolio", href: "#portfolio", id: "portfolio" },
  { key: "testimonials", href: "#testimonials", id: "testimonials" },
  { key: "whyUs", href: "#why-us", id: "why-us" },
  { key: "pricing", href: "#pricing", id: "pricing" },
  { key: "faq", href: "#faq", id: "faq" },
  { key: "about", href: "#about", id: "about" },
  { key: "blog", href: "#blog", id: "blog" },
  { key: "referral", href: "#referral", id: "referral" },
  { key: "contact", href: "#contact", id: "contact" },
]

// Footer navigation intentionally excludes the "Why us" anchor.
export const FOOTER_NAV_ITEMS: NavItem[] = NAV_ITEMS.filter((i) => i.key !== "whyUs")
