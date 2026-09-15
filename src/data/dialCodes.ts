// Country dial codes for the international phone field. Haiti first (primary
// audience), then the diaspora hubs, then a broad international list. `iso` is
// used to preselect from the detected region; `dial` is the E.164 prefix.
export interface DialCountry {
  iso: string
  name: string
  flag: string
  dial: string
}

export const DIAL_COUNTRIES: DialCountry[] = [
  { iso: "HT", name: "Haïti", flag: "🇭🇹", dial: "+509" },
  { iso: "US", name: "États-Unis", flag: "🇺🇸", dial: "+1" },
  { iso: "CA", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { iso: "DO", name: "Rép. Dominicaine", flag: "🇩🇴", dial: "+1" },
  { iso: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { iso: "BR", name: "Brésil", flag: "🇧🇷", dial: "+55" },
  { iso: "CL", name: "Chili", flag: "🇨🇱", dial: "+56" },
  { iso: "MX", name: "Mexique", flag: "🇲🇽", dial: "+52" },
  { iso: "AE", name: "Émirats", flag: "🇦🇪", dial: "+971" },
  { iso: "BE", name: "Belgique", flag: "🇧🇪", dial: "+32" },
  { iso: "CH", name: "Suisse", flag: "🇨🇭", dial: "+41" },
  { iso: "DE", name: "Allemagne", flag: "🇩🇪", dial: "+49" },
  { iso: "ES", name: "Espagne", flag: "🇪🇸", dial: "+34" },
  { iso: "GB", name: "Royaume-Uni", flag: "🇬🇧", dial: "+44" },
  { iso: "IT", name: "Italie", flag: "🇮🇹", dial: "+39" },
  { iso: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351" },
  { iso: "NL", name: "Pays-Bas", flag: "🇳🇱", dial: "+31" },
  { iso: "SN", name: "Sénégal", flag: "🇸🇳", dial: "+221" },
  { iso: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", dial: "+225" },
  { iso: "CD", name: "RD Congo", flag: "🇨🇩", dial: "+243" },
  { iso: "CM", name: "Cameroun", flag: "🇨🇲", dial: "+237" },
  { iso: "GP", name: "Guadeloupe", flag: "🇬🇵", dial: "+590" },
  { iso: "MQ", name: "Martinique", flag: "🇲🇶", dial: "+596" },
  { iso: "GF", name: "Guyane", flag: "🇬🇫", dial: "+594" },
  { iso: "BS", name: "Bahamas", flag: "🇧🇸", dial: "+1" },
  { iso: "JM", name: "Jamaïque", flag: "🇯🇲", dial: "+1" },
  { iso: "PA", name: "Panama", flag: "🇵🇦", dial: "+507" },
  { iso: "AR", name: "Argentine", flag: "🇦🇷", dial: "+54" },
  { iso: "CO", name: "Colombie", flag: "🇨🇴", dial: "+57" },
]

const DEFAULT_ISO = "HT"

// Preselect a dial country from an app RegionCode (US/HT/CA/EU/DO/BR/AE/OTHER).
export function isoForRegion(region?: string): string {
  switch (region) {
    case "US": return "US"
    case "CA": return "CA"
    case "DO": return "DO"
    case "BR": return "BR"
    case "AE": return "AE"
    case "EU": return "FR"
    default: return DEFAULT_ISO // HT + OTHER → Haiti-first
  }
}

export function findByIso(iso: string): DialCountry {
  return DIAL_COUNTRIES.find((c) => c.iso === iso) ?? DIAL_COUNTRIES[0]
}
