import { useEffect } from "react"
import { useSettings } from "../context/AppSettings"
import { applyPageMeta } from "../lib/seo"
import About from "../components/About"

// Dedicated /a-propos page — hosts the (previously homepage-only) About section
// so it's reachable again via the footer, without re-crowding the home funnel.
export default function Apropos() {
  const { t, lang } = useSettings()
  const a = t.about

  useEffect(() => {
    window.scrollTo(0, 0)
    // Strip rich-text markers ({logo}, **bold**) for clean meta text.
    const clean = (s: string) => s.replace(/\{[^}]*\}/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim()
    applyPageMeta({
      title: `${clean(a.title)} — INOV Digital Services`,
      description: clean(a.intro),
      url: `${window.location.origin}/a-propos`,
      type: "website",
    })
  }, [lang, a.title, a.intro])

  return <About />
}
