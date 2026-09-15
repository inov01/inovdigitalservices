import { useEffect, useRef, useState } from "react"
import { MessageCircle } from "lucide-react"
import { DIAL_COUNTRIES, findByIso, resolveIso } from "../data/dialCodes"

// International phone/WhatsApp input: an indicatif (dial-code) selector in front
// of the local number, so we always capture a full number that `wa.me` can use.
// The indicatif is preselected from the visitor's detected geographic position
// (precise ISO country, falling back to the coarse region). Emits a normalized
// `"+509 34567890"` string via onChange; the backend strips non-digits for wa.me.
export default function PhoneField({
  value, onChange, country, region, placeholder, label, required,
}: {
  value: string
  onChange: (full: string) => void
  country?: string
  region?: string
  placeholder?: string
  label?: string
  required?: boolean
}) {
  const [iso, setIso] = useState(() => resolveIso(country, region))
  const [local, setLocal] = useState("")
  const touched = useRef(false)

  // Follow the geo detection (which resolves asynchronously after mount) until
  // the user picks an indicatif or starts typing a number themselves.
  useEffect(() => {
    if (touched.current) return
    setIso(resolveIso(country, region))
  }, [country, region])

  function emit(nextIso: string, nextLocal: string) {
    const digits = nextLocal.replace(/[^\d]/g, "")
    onChange(digits ? `${findByIso(nextIso).dial} ${digits}` : "")
  }

  const selected = findByIso(iso)

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
          onChange={(e) => { touched.current = true; setIso(e.target.value); emit(e.target.value, local) }}
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
          onChange={(e) => { touched.current = true; setLocal(e.target.value); emit(iso, e.target.value) }}
          style={{
            flex: 1, minWidth: 0, padding: "12px 14px", borderRadius: "var(--r-md)",
            border: "1px solid var(--ds-border)", background: "var(--ds-bg)",
            color: "var(--ds-text)", fontSize: 15, fontFamily: "'Outfit', sans-serif",
          }}
        />
      </div>
      {local && (
        <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: 12, color: "var(--ds-text-muted)", margin: "6px 0 0" }}>
          {selected.flag} {selected.dial} {local.replace(/[^\d]/g, "")}
        </p>
      )}
    </div>
  )
}
