import {
  Home, Inbox, Wallet, MessageSquareQuote, FileText, Tags, Package, LayoutGrid,
  Newspaper, GraduationCap, Handshake, Mail, Send, Link2, Sparkles, CalendarClock,
  ClipboardList, Bell, Settings as SettingsIcon, BookOpen, MessagesSquare,
} from "lucide-react"

// All admin section keys. `home` is the overview landing view; the rest map 1:1 to
// the existing tab components. Keeping this union here (rather than inline in the
// shell) lets nav config, deep-linking and the command palette share one source.
export type Tab =
  | "home"
  | "leads" | "payments" | "reviews" | "documents"
  | "pricing" | "services" | "portfolio" | "blog" | "formation" | "collaborateurs"
  | "newsletter" | "campaigns" | "links" | "social"
  | "assistant" | "reminders" | "procedures" | "eventualites" | "scripts"
  | "settings"

export interface NavItem {
  key: Tab
  label: string
  icon: React.ReactNode
  /** Short hint shown in the command palette for extra searchable context. */
  hint?: string
}
export interface NavGroup {
  label: string
  items: NavItem[]
}

const ic = { size: 18 } as const

// The 18 sections regrouped into 5 business-meaningful categories so the admin
// stops being one flat 18-item list. Order within groups mirrors daily workflow.
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Commercial",
    items: [
      { key: "leads", label: "Devis & contacts", icon: <Inbox {...ic} />, hint: "prospects leads demandes" },
      { key: "payments", label: "Paiements", icon: <Wallet {...ic} />, hint: "moncash natcash buh upwork" },
      { key: "reviews", label: "Avis clients", icon: <MessageSquareQuote {...ic} />, hint: "témoignages notes" },
      { key: "documents", label: "Proforma & reçus", icon: <FileText {...ic} />, hint: "pdf facture devis" },
    ],
  },
  {
    label: "Contenu du site",
    items: [
      { key: "pricing", label: "Tarifs", icon: <Tags {...ic} />, hint: "prix ppp régions" },
      { key: "services", label: "Cartes de service", icon: <Package {...ic} /> },
      { key: "portfolio", label: "Portfolio", icon: <LayoutGrid {...ic} />, hint: "galeries albums travaux" },
      { key: "blog", label: "Blog", icon: <Newspaper {...ic} />, hint: "articles" },
      { key: "formation", label: "Formations", icon: <GraduationCap {...ic} />, hint: "cours live replay conférence" },
      { key: "scripts", label: "Scripts formations", icon: <BookOpen {...ic} />, hint: "conférence cours préenregistrés plan de séance" },
      { key: "collaborateurs", label: "Collaborateurs", icon: <Handshake {...ic} /> },
    ],
  },
  {
    label: "Marketing",
    items: [
      { key: "newsletter", label: "Newsletter", icon: <Mail {...ic} />, hint: "abonnés" },
      { key: "campaigns", label: "Campagnes e-mail", icon: <Send {...ic} /> },
      { key: "links", label: "Liens à partager", icon: <Link2 {...ic} /> },
      { key: "social", label: "Réponses sociales", icon: <MessagesSquare {...ic} />, hint: "instagram facebook commentaires dm faq réponses vidéo" },
    ],
  },
  {
    label: "Outils & IA",
    items: [
      { key: "assistant", label: "Assistant IA", icon: <Sparkles {...ic} />, hint: "gemini chat" },
      { key: "reminders", label: "Rappels & RDV", icon: <CalendarClock {...ic} /> },
      { key: "procedures", label: "Procédures services", icon: <ClipboardList {...ic} /> },
      { key: "eventualites", label: "Éventualités", icon: <Bell {...ic} />, hint: "incidents journal" },
    ],
  },
  {
    label: "Système",
    items: [
      { key: "settings", label: "Paramètres", icon: <SettingsIcon {...ic} />, hint: "sécurité 2fa mfa" },
    ],
  },
]

// The standalone overview entry rendered above the groups.
export const HOME_ITEM: NavItem = { key: "home", label: "Accueil", icon: <Home {...ic} /> }

// Flat lookup used by the command palette and breadcrumb.
export const ALL_ITEMS: NavItem[] = [HOME_ITEM, ...NAV_GROUPS.flatMap((g) => g.items)]

export function itemFor(key: Tab): NavItem {
  return ALL_ITEMS.find((i) => i.key === key) ?? HOME_ITEM
}
export function groupOf(key: Tab): string | null {
  for (const g of NAV_GROUPS) if (g.items.some((i) => i.key === key)) return g.label
  return null
}
