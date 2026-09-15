import { useEffect, useRef, useState } from "react"
import { MessageCircle } from "lucide-react"
import { DIAL_COUNTRIES, findByIso, isoForRegion } from "../data/dialCodes"

// International phone/WhatsApp input: an indicatif (dial-code) selector in front
// of the local number, so we always capture a full number that `wa.me` can use.
// Emits a normalized `"+509 34567890"` style string via onChange; the backend
// strips non-digits when building the wa.me link.
export default function PhoneField({
  value, onChange, region, placeholder, label, required,
}: {
  value: string
  onChange: (full: string) => void
  region?: string
  placeholder?: string
  label?: string
  required?: boolean
}) {
  const [iso, setIso] = useState(() => isoForRegion(region))
  const [local, setLocal] = useState("")
  const firstRegion = useRef(true)

  // Follow the detected region until the user starts typing a number.
  useEffect(() => {
    if (firstRegion.current) { firstRegion.current = false; return }
    if (!local) setIso(isoForRegion(region))
  }, [region]) // eslint-disable-line react-hooks/exhaustive-deps

  function emit(nextIso: string, nextLocal: string) {
    const digits = nextLocal.replace(/[^\d]/g, "")
    onChange(digits ? `${findByIso(nextIso).dial} ${digits}` : "")
  }

  const country = findByIso(iso)

  return (
    <div>
      {label && (
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Outfit', sans-serif", fontSize: 13, fontWeight: 700, color: "var(--ds-text)", margin: "0 0 6px" }}>
          <MessageCircle size={14} style={{ color: "#25D366" }} /> {label}
          {required && <span style={{ color: "var(--ds-danger)" }}>*</span>}
        </label>
      )}
      <div style={{ display: "flex", gap: 8 }}>
        <select
          aria-label="Indicatif pays"
          value={iso}
          onChange={(e) => { setIso(e.target.value); emit(e.target.value, local) }}
          style={{
            flexShrink: 0, width: 116, padding: "12px 8px", borderRadius: "var(--r-md)",
            border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
            color: "var(--ds-text)", fontSize: 14.5, fontFamily: "'Outfit', sans-serif", cursor: "pointer",
          }}
        >
          {DIAL_COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>{c.flag} {c.dial}</option>
          ))}
        </select>
        <input
          type="tel"
          inputMode="tel"
          aria-label={label || placeholder}
          placeholder={placeholder}
          value={local}
          required={required}
          onChange={(e) => { setLocal(e.target.value); emit(iso, e.target.value) }}
          style={{
            flex: 1, minWidth: 0, padding: "12px 14px", borderRadius: "var(--r-md)",
            border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
            color: "var(--ds-text)", fontSize: 15, fontFamily: "'Outfit', sans-serif",
          }}
        />
      </div>
      {local && (
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", margin: "6px 0 0" }}>
          {country.flag} {country.dial} {local.replace(/[^\d]/g, "")}
        </p>
      )}
    </div>
  )
}
