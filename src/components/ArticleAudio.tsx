import { useEffect, useMemo, useRef, useState } from "react"
import { Volume2, Pause, Play, Square } from "lucide-react"

// Detect the actual language of the text so we pick a matching voice even when
// the reader's UI language differs from the article's language (e.g. a French
// article read while the interface is in English). Without this, the browser
// would speak French words with an English voice — the reported accent bug.
const HINTS: Record<string, string[]> = {
  fr: ["le", "la", "les", "des", "une", "est", "vous", "pour", "votre", "avec", "qui", "plus", "nous", "pas", "sur"],
  en: ["the", "and", "you", "your", "for", "with", "that", "this", "are", "not", "our", "have"],
  es: ["el", "los", "las", "una", "para", "con", "que", "más", "por", "su", "como", "pero"],
  pt: ["os", "as", "uma", "para", "com", "que", "mais", "por", "sua", "não", "como", "seu"],
  it: ["il", "gli", "una", "per", "con", "che", "più", "non", "suo", "questo", "come", "sono"],
  de: ["der", "die", "das", "und", "für", "mit", "ist", "sie", "ihre", "nicht", "ein", "auch"],
}

function detectLang(text: string, fallback: string): string {
  if (/[؀-ۿ]/.test(text)) return "ar"
  const pad = " " + text.toLowerCase().replace(/[^a-zàâäéèêëïîôöùûüÿçñáíóúãõ]+/g, " ").trim() + " "
  let best = fallback
  let bestScore = 0
  for (const [lg, words] of Object.entries(HINTS)) {
    let score = 0
    for (const w of words) {
      let i = pad.indexOf(" " + w + " ")
      while (i !== -1) { score++; i = pad.indexOf(" " + w + " ", i + 1) }
    }
    if (score > bestScore) { bestScore = score; best = lg }
  }
  // Require a minimum signal; otherwise trust the caller's language.
  return bestScore >= 3 ? best : fallback
}

// BCP-47 locale used to pick a voice per app language. Haitian Creole has no
// common TTS voice, so it falls back to French (closest phonetically).
const LOCALE: Record<string, string> = {
  fr: "fr-FR", en: "en-US", es: "es-ES", ht: "fr-FR",
  pt: "pt-BR", it: "it-IT", de: "de-DE", ar: "ar-SA",
}

const LABELS: Record<string, { listen: string; pause: string; resume: string; stop: string; playing: string }> = {
  fr: { listen: "Écouter l'article", pause: "Pause", resume: "Reprendre", stop: "Arrêter", playing: "Lecture en cours…" },
  en: { listen: "Listen to the article", pause: "Pause", resume: "Resume", stop: "Stop", playing: "Playing…" },
  es: { listen: "Escuchar el artículo", pause: "Pausa", resume: "Reanudar", stop: "Detener", playing: "Reproduciendo…" },
  ht: { listen: "Koute atik la", pause: "Kanpe", resume: "Kontinye", stop: "Sispann", playing: "L ap li…" },
  pt: { listen: "Ouvir o artigo", pause: "Pausar", resume: "Retomar", stop: "Parar", playing: "A reproduzir…" },
  it: { listen: "Ascolta l'articolo", pause: "Pausa", resume: "Riprendi", stop: "Ferma", playing: "In riproduzione…" },
  de: { listen: "Artikel anhören", pause: "Pause", resume: "Fortsetzen", stop: "Stopp", playing: "Wird abgespielt…" },
  ar: { listen: "استمع إلى المقال", pause: "إيقاف مؤقت", resume: "استئناف", stop: "إيقاف", playing: "جارٍ التشغيل…" },
}

// Splits long text into short sentence-based chunks. Chrome cuts off long
// single utterances (~15s), so queueing shorter ones keeps playback reliable.
function buildChunks(t: string): string[] {
  const clean = t.replace(/\s+/g, " ").trim()
  const sentences = clean.match(/[^.!?…]+[.!?…]*\s*/g) ?? [clean]
  const out: string[] = []
  let cur = ""
  for (const s of sentences) {
    if ((cur + s).length > 220) {
      if (cur.trim()) out.push(cur.trim())
      cur = s
    } else {
      cur += s
    }
  }
  if (cur.trim()) out.push(cur.trim())
  return out
}

export default function ArticleAudio({ text, lang }: { text: string; lang: string }) {
  const [supported, setSupported] = useState(false)
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle")
  const chunksRef = useRef<string[]>([])
  const idxRef = useRef(0)
  const stoppedRef = useRef(false)

  const L = LABELS[lang] ?? LABELS.fr
  // Language used to choose the voice — derived from the text, not the UI.
  const voiceLang = useMemo(() => detectLang(text, lang), [text, lang])
  const voicesRef = useRef<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window
    setSupported(ok)
    if (!ok) return
    // getVoices() is async: it's often empty on the first call and only fills
    // once the engine loads voices, firing `voiceschanged`. Without this the
    // picker finds nothing and the browser falls back to its default (en-US)
    // voice — the "American accent" bug. We keep the list refreshed here.
    const load = () => { voicesRef.current = window.speechSynthesis.getVoices() }
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => { try { window.speechSynthesis.onvoiceschanged = null } catch { /* noop */ } }
  }, [])

  // Stop any speech when the article (text/lang) changes or on unmount.
  useEffect(() => {
    return () => {
      stoppedRef.current = true
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
    }
  }, [text, lang])

  function pickVoice(): SpeechSynthesisVoice | null {
    const voices = voicesRef.current.length ? voicesRef.current : window.speechSynthesis.getVoices()
    const loc = (LOCALE[voiceLang] ?? "en-US").toLowerCase()
    const pref = loc.slice(0, 2)
    const norm = (s: string) => s.replace("_", "-").toLowerCase()
    // Only consider voices of the target language; never cross-language fall back
    // (that's what produced an English voice reading French text).
    const sameLang = voices.filter((v) => norm(v.lang).startsWith(pref))
    if (!sameLang.length) return null
    // Rank by how human the voice sounds. Modern neural/cloud voices (Google,
    // Microsoft "Natural"/"Neural", Apple "Siri"/"Premium/Enhanced") are far more
    // lifelike than the built-in "localService" robots we used to prefer — so we
    // now score those UP and use localService only as a last-resort tiebreaker.
    const HUMAN = ["natural", "neural", "wavenet", "premium", "enhanced", "siri", "google", "multilingual", "studio", "journey"]
    const score = (v: SpeechSynthesisVoice): number => {
      const name = v.name.toLowerCase()
      let s = 0
      if (norm(v.lang) === loc) s += 6                       // exact locale match
      for (const kw of HUMAN) if (name.includes(kw)) { s += 5; break } // lifelike engine
      if (!v.localService) s += 2                            // cloud voices are usually richer
      return s
    }
    return [...sameLang].sort((a, b) => score(b) - score(a))[0] ?? sameLang[0]
  }

  function speakNext() {
    const chunks = chunksRef.current
    const i = idxRef.current
    if (stoppedRef.current || i >= chunks.length) {
      setState("idle")
      idxRef.current = 0
      return
    }
    const u = new SpeechSynthesisUtterance(chunks[i])
    const v = pickVoice()
    if (v) u.voice = v
    u.lang = LOCALE[voiceLang] ?? "en-US"
    // Slightly slower than default with a natural pitch reads as calmer and more
    // human than the robotic full-speed monotone.
    u.rate = 0.96
    u.pitch = 1.02
    u.onend = () => {
      if (stoppedRef.current) return
      idxRef.current += 1
      // A short breath between sentences mimics natural speech pacing.
      setTimeout(() => { if (!stoppedRef.current) speakNext() }, 140)
    }
    u.onerror = () => {
      if (stoppedRef.current) return
      idxRef.current += 1
      speakNext()
    }
    window.speechSynthesis.speak(u)
  }

  function play() {
    window.speechSynthesis.cancel()
    chunksRef.current = buildChunks(text)
    idxRef.current = 0
    stoppedRef.current = false
    setState("playing")
    speakNext()
  }

  function pause() {
    window.speechSynthesis.pause()
    setState("paused")
  }

  function resume() {
    window.speechSynthesis.resume()
    setState("playing")
  }

  function stop() {
    stoppedRef.current = true
    window.speechSynthesis.cancel()
    idxRef.current = 0
    setState("idle")
  }

  if (!supported) return null

  const pillBtn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 700,
    padding: "10px 18px", borderRadius: "var(--r-full)", cursor: "pointer",
    border: "none", transition: "filter 0.2s, transform 0.15s",
  }

  return (
    <div
      style={{
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
        background: "var(--ds-accent-a10)", border: "1px solid var(--ds-accent-a30)",
        borderRadius: "var(--r-lg)", padding: "12px 14px", marginBottom: 32,
      }}
    >
      <div style={{
        width: 38, height: 38, borderRadius: "var(--r-md)", flexShrink: 0,
        background: "var(--ds-accent-grad)", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Volume2 size={19} aria-hidden="true" />
      </div>

      {state === "idle" && (
        <button
          onClick={play}
          style={{ ...pillBtn, background: "var(--ds-accent-grad)", color: "#fff" }}
          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)" }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = "none" }}
        >
          <Play size={15} /> {L.listen}
        </button>
      )}

      {state !== "idle" && (
        <>
          <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 13.5, fontWeight: 600, color: "var(--ds-accent-text)", marginRight: "auto" }}>
            {L.playing}
          </span>
          {state === "playing" ? (
            <button
              onClick={pause}
              style={{ ...pillBtn, background: "#fff", color: "var(--ds-accent-text)", border: "1px solid var(--ds-accent-a30)" }}
            >
              <Pause size={15} /> {L.pause}
            </button>
          ) : (
            <button
              onClick={resume}
              style={{ ...pillBtn, background: "var(--ds-accent-grad)", color: "#fff" }}
            >
              <Play size={15} /> {L.resume}
            </button>
          )}
          <button
            onClick={stop}
            aria-label={L.stop}
            style={{ ...pillBtn, background: "#fff", color: "var(--ds-text-sec)", border: "1px solid var(--ds-border-strong)" }}
          >
            <Square size={14} /> {L.stop}
          </button>
        </>
      )}
    </div>
  )
}
