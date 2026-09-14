// Réponses sociales — modèles de réponses Instagram/Facebook/WhatsApp.
// Source unique : édités ici, ils alimentent l'automatisation (webhook Meta) ET
// servent de bibliothèque à copier-coller pour répondre à la main (ex. commentaires
// sous les vidéos) tant que l'automatisation n'est pas encore activée.
import { useEffect, useState } from "react"
import { Loader2, Plus, Trash2, Copy, Check, Save, Sparkles, MessageSquare, MessagesSquare, HelpCircle } from "lucide-react"
import { adminApi, type SiteSettings, type SocialReplies } from "../../../lib/api"
import { card, btn, btnPrimary, input, sectionTitle, smallLabel, Empty } from "../shared"

const DEFAULT_SOCIAL: SocialReplies = {
  waitMessage: "",
  commentReply: "",
  useGemini: false,
  faq: [],
  snippets: [],
}

// Textes de repli réellement utilisés par le serveur quand un champ est laissé vide
// (affichés en placeholder pour que le propriétaire sache ce qui partira par défaut).
const FALLBACK_WAIT =
  "Bonjour ! 👋 Merci d'avoir contacté INOV Digital Services. Nous avons bien reçu votre message et un membre de l'équipe vous répond très vite. 🎨"
const FALLBACK_COMMENT = "Merci pour votre message ! 🙏 On vous répond en privé."

const textarea: React.CSSProperties = { ...input, minHeight: 84, lineHeight: 1.5, resize: "vertical", padding: 12 }

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      style={{ ...btn, gap: 6 }}
      className="adm-iconbtn"
      disabled={!text.trim()}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        } catch { /* clipboard indisponible */ }
      }}
    >
      {done ? <Check size={15} /> : <Copy size={15} />} {done ? "Copié" : "Copier"}
    </button>
  )
}

export function SocialRepliesTab() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [sr, setSr] = useState<SocialReplies>(DEFAULT_SOCIAL)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState("")

  useEffect(() => {
    adminApi
      .getSettings()
      .then((r) => {
        setSettings(r.settings)
        setSr({ ...DEFAULT_SOCIAL, ...(r.settings.socialReplies ?? {}) })
      })
      .catch(() => setErr("Impossible de charger les paramètres."))
  }, [])

  function patch(p: Partial<SocialReplies>) {
    setSr((s) => ({ ...s, ...p }))
    setSaved(false)
  }

  async function save() {
    if (!settings) return
    setSaving(true)
    setErr("")
    try {
      // On renvoie l'objet settings COMPLET (le serveur reconstruit tout) : on
      // ne modifie que socialReplies pour ne rien écraser d'autre.
      const next: SiteSettings = { ...settings, socialReplies: sr }
      const r = await adminApi.saveSettings(next)
      setSettings(r.settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setErr("Échec de l'enregistrement. Réessayez.")
    } finally {
      setSaving(false)
    }
  }

  if (!settings && !err) {
    return (
      <div style={{ ...card, display: "flex", alignItems: "center", gap: 10, color: "var(--ds-text-muted)" }}>
        <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Chargement…
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <p style={{ margin: 0, fontSize: 13.5, color: "var(--ds-text-muted)", lineHeight: 1.6 }}>
        Ces textes servent à <strong>deux choses</strong> : ils alimentent l'automatisation
        (réponses auto aux DM et commentaires Instagram/Facebook) <em>et</em> vous pouvez les
        <strong> copier pour répondre à la main</strong> — par exemple aux commentaires sous vos
        vidéos — même avant que l'automatisation soit activée.
      </p>

      {/* Message d'attente */}
      <section style={card}>
        <div style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} /> Message d'attente (accusé de réception)
        </div>
        <p style={smallLabel}>Envoyé automatiquement quand aucune règle FAQ ne correspond, pour que la personne ait une réponse instantanée pendant que vous préparez la vôtre.</p>
        <textarea
          style={textarea}
          value={sr.waitMessage}
          placeholder={FALLBACK_WAIT}
          onChange={(e) => patch({ waitMessage: e.target.value })}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <CopyBtn text={sr.waitMessage || FALLBACK_WAIT} />
        </div>
      </section>

      {/* Réponse publique aux commentaires */}
      <section style={card}>
        <div style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <MessagesSquare size={16} /> Réponse publique aux commentaires
        </div>
        <p style={smallLabel}>Publiée sous un commentaire (vidéo, post…), avant de basculer la conversation en message privé.</p>
        <textarea
          style={textarea}
          value={sr.commentReply}
          placeholder={FALLBACK_COMMENT}
          onChange={(e) => patch({ commentReply: e.target.value })}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
          <CopyBtn text={sr.commentReply || FALLBACK_COMMENT} />
        </div>
      </section>

      {/* FAQ par mot-clé */}
      <section style={card}>
        <div style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <HelpCircle size={16} /> Réponses FAQ (mot-clé → réponse)
        </div>
        <p style={smallLabel}>La première règle dont un mot-clé apparaît dans le message gagne. Séparez les mots-clés par des virgules (insensible aux accents/majuscules).</p>
        <div style={{ display: "grid", gap: 12 }}>
          {sr.faq.length === 0 && <Empty text="Aucune règle. Ajoutez-en une pour répondre automatiquement aux questions fréquentes (prix, délai…)." />}
          {sr.faq.map((rule, i) => (
            <div key={i} style={{ border: "1px solid var(--ds-border)", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
              <input
                style={input}
                value={rule.keywords.join(", ")}
                placeholder="Mots-clés : prix, tarif, combien"
                onChange={(e) =>
                  patch({ faq: sr.faq.map((r, j) => (j === i ? { ...r, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) } : r)) })
                }
              />
              <textarea
                style={textarea}
                value={rule.answer}
                placeholder="Réponse envoyée quand un de ces mots-clés apparaît…"
                onChange={(e) => patch({ faq: sr.faq.map((r, j) => (j === i ? { ...r, answer: e.target.value } : r)) })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button type="button" style={{ ...btn, color: "var(--ds-danger, #d33)" }} className="adm-iconbtn" onClick={() => patch({ faq: sr.faq.filter((_, j) => j !== i) })}>
                  <Trash2 size={15} /> Supprimer
                </button>
                <CopyBtn text={rule.answer} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" style={{ ...btn, marginTop: 12 }} className="adm-iconbtn" onClick={() => patch({ faq: [...sr.faq, { keywords: [], answer: "" }] })}>
          <Plus size={15} /> Ajouter une règle
        </button>
      </section>

      {/* Bibliothèque de réponses (usage manuel) */}
      <section style={card}>
        <div style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 8 }}>
          <Copy size={16} /> Bibliothèque de réponses (à copier-coller)
        </div>
        <p style={smallLabel}>Réponses prêtes à l'emploi pour répondre vous-même — idéal pour les commentaires sous vos vidéos. Elles n'envoient rien automatiquement : le bouton copie le texte.</p>
        <div style={{ display: "grid", gap: 12 }}>
          {sr.snippets.length === 0 && <Empty text="Aucune réponse enregistrée. Ajoutez vos formulations habituelles pour les réutiliser en un clic." />}
          {sr.snippets.map((sn, i) => (
            <div key={i} style={{ border: "1px solid var(--ds-border)", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
              <input
                style={input}
                value={sn.title}
                placeholder="Titre (ex. « Merci pour le commentaire »)"
                onChange={(e) => patch({ snippets: sr.snippets.map((s, j) => (j === i ? { ...s, title: e.target.value } : s)) })}
              />
              <textarea
                style={textarea}
                value={sn.text}
                placeholder="Texte de la réponse…"
                onChange={(e) => patch({ snippets: sr.snippets.map((s, j) => (j === i ? { ...s, text: e.target.value } : s)) })}
              />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <button type="button" style={{ ...btn, color: "var(--ds-danger, #d33)" }} className="adm-iconbtn" onClick={() => patch({ snippets: sr.snippets.filter((_, j) => j !== i) })}>
                  <Trash2 size={15} /> Supprimer
                </button>
                <CopyBtn text={sn.text} />
              </div>
            </div>
          ))}
        </div>
        <button type="button" style={{ ...btn, marginTop: 12 }} className="adm-iconbtn" onClick={() => patch({ snippets: [...sr.snippets, { title: "", text: "" }] })}>
          <Plus size={15} /> Ajouter une réponse
        </button>
      </section>

      {/* Option Gemini */}
      <section style={card}>
        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
          <input type="checkbox" checked={sr.useGemini} onChange={(e) => patch({ useGemini: e.target.checked })} style={{ marginTop: 3 }} />
          <span>
            <span style={{ ...sectionTitle, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
              <Sparkles size={16} /> Réponses intelligentes (Gemini)
            </span>
            <span style={{ ...smallLabel, display: "block", marginTop: 4 }}>
              Quand aucune règle FAQ ne correspond, une réponse est rédigée par l'IA (au lieu du simple
              message d'attente). Nécessite la clé <code>GEMINI_API_KEY</code> côté serveur.
            </span>
          </span>
        </label>
      </section>

      {/* Barre d'enregistrement */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, position: "sticky", bottom: 0, padding: "12px 0", background: "var(--ds-bg)" }}>
        <button type="button" style={{ ...btnPrimary, gap: 8 }} className="adm-iconbtn" onClick={save} disabled={saving || !settings}>
          {saving ? <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> : <Save size={16} />} Enregistrer
        </button>
        {saved && <span style={{ color: "var(--ds-success, #1a9d5a)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Check size={15} /> Enregistré</span>}
        {err && <span style={{ color: "var(--ds-danger, #d33)", fontSize: 13 }}>{err}</span>}
      </div>
    </div>
  )
}

export default SocialRepliesTab
