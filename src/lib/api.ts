import { projectId, publicAnonKey } from "./supabaseConfig"
import { supabase } from "./supabaseClient"
import { getStoredRef } from "./referral"
import { ensureStepUp } from "./stepup"

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-df4bb120`

// Public call — authenticated with the anon key (satisfies the function gateway;
// the server treats these as anonymous and only allows public routes).
async function pub<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${publicAnonKey}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

// Authenticated call — uses the logged-in admin's access token.
async function auth<T>(path: string, init: RequestInit = {}): Promise<T> {
  // Any write to the admin backend requires a fresh identity proof (password + 2FA).
  await ensureStepUp(init.method)
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("Not authenticated")
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

// Authenticated call WITHOUT the step-up gate. Used only for the AI assistant,
// which never mutates site data — it just relays a chat to Gemini via the server.
// The admin token is still required (the server enforces the admin allowlist).
async function authChat<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("Not authenticated")
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

export interface AssistantMessage {
  role: "user" | "assistant"
  content: string
}

// ── Types ────────────────────────────────────────────────────────────────────
export interface LeadItem {
  name: string
  tier?: string
  qty: number
  price: number
}
export interface Lead {
  id: string
  createdAt: string
  status: "new" | "contacted" | "won" | "lost"
  source: "quote" | "contact" | string
  name: string
  email: string
  phone: string
  lang: string
  currency: string
  region: string
  total: number | null
  deposit: number | null
  items: LeadItem[]
  budget: string
  message: string
  meta: Record<string, unknown>
}
export interface Subscriber {
  email: string
  lang: string
  createdAt: string
}
// A client-submitted testimonial. "pending" until an admin approves it; only
// approved ones are returned by the public endpoint and shown on the site.
export interface Testimonial {
  id: string
  createdAt: string
  status: "pending" | "approved"
  name: string
  role: string
  company: string
  text: string
  stars: number
  lang: string
}
// The public shape (no status — the public endpoint only returns approved ones).
export type PublicTestimonial = Omit<Testimonial, "status">
export interface TestimonialInput {
  name: string
  role?: string
  company?: string
  text: string
  stars: number
  lang: string
}
// One client-uploaded brief attachment, stored (as a list) in a lead's meta.
export interface BriefAttachment {
  path: string
  name: string
  size: number
  type: string
}
export interface Campaign {
  id: string
  subject: string
  lang: string
  scheduledAt: string
  status: "scheduled" | "sent" | "failed"
  createdAt: string
  htmlLength: number
  result: { sent?: number; failed?: number; errors?: string[]; error?: string; dispatchedAt?: string } | null
}
// Admin-managed service card added from the dashboard (mirrors PricingService,
// minus the runtime `qty`). Images are URLs (external or /public-hosted).
export interface AdminService {
  id: number
  name: string
  desc: string
  price: number
  type: "static" | "video"
  advantage: string
  deliveryDays: number
  revisions: number
  revisionDays: number
  exampleImg?: string
  projectUrl?: string
  featured?: boolean
  quoteOnly?: boolean
}
export interface AdminWork {
  title: string
  category: string
  desc: string
  img?: string
  videoId?: string
}
// Admin-managed portfolio item. group "client" → shown in "Réalisations par
// client" (needs a logo); group "other" → shown in "Autres réalisations".
export interface AdminAlbum {
  id: string
  group: "client" | "other"
  client: string
  ceo?: string
  logo?: string
  tagline: string
  accent?: string
  impact?: string
  serviceLabels?: string[]
  works: AdminWork[]
}
// Admin-authored blog article added from the dashboard. Single-language (the
// language the admin typed it in); shown to every visitor. Body paragraphs use
// a leading "## " to mark a subheading, matching the built-in article format.
export interface AdminBlog {
  id: string
  tag: string
  read: number
  title: string
  excerpt: string
  body: string[]
  image?: string
  slug?: string
}
export interface SiteSettings {
  announcement: { enabled: boolean; text: string; link: string }
  /** Admin base-price overrides in USD, keyed by service id. Read by the public
   *  Pricing page and the admin document generator; empty = use data defaults. */
  pricing?: Record<string, number>
  /** Ids of built-in services the admin has hidden from the site. */
  servicesRemoved?: number[]
  /** Extra service cards the admin added from the dashboard. */
  servicesAdded?: AdminService[]
  /** Ids of built-in portfolio albums the admin has hidden. */
  albumsRemoved?: string[]
  /** Extra portfolio albums the admin added from the dashboard. */
  albumsAdded?: AdminAlbum[]
  /** Individual works hidden inside an album, keyed as `${albumId}#${index}`. */
  worksRemoved?: string[]
  /** Extra works appended to an album, keyed by album id. */
  worksAdded?: Record<string, AdminWork[]>
  /** Ids of built-in blog articles the admin has hidden. */
  blogsRemoved?: string[]
  /** Extra blog articles the admin wrote from the dashboard. */
  blogsAdded?: AdminBlog[]
  /** Social auto-reply templates (Instagram/Facebook/WhatsApp), editable from the
   *  "Réponses sociales" panel and reusable as manual copy-paste snippets. */
  socialReplies?: SocialReplies
  /** Payment / payout coordinates shown on /payer. Served from Supabase secrets or
   *  the admin panel — never hardcoded in the repo. */
  payments?: PaymentConfig
}

export interface PaymentConfig {
  moncash: { number: string; holder: string }
  natcash: { number: string; holder: string }
  buh: { bank: string; account: string; holder: string; type: string }
  upwork: { email: string }
  whatsapp: string
}

export interface SocialFaqRule { keywords: string[]; answer: string }
export interface SocialSnippet { title: string; text: string }
export interface SocialReplies {
  /** Instant acknowledgement sent when nothing else matched. */
  waitMessage: string
  /** Public reply posted under a comment before moving to a private DM. */
  commentReply: string
  /** When true, unmatched DMs get a Gemini-drafted reply. */
  useGemini: boolean
  /** Keyword → answer rules (first match wins). */
  faq: SocialFaqRule[]
  /** Ready-to-use reply library for replying by hand (e.g. video comments). */
  snippets: SocialSnippet[]
}

// ── Formations (espace Formation) ──────────────────────────────────────────────
export interface Formation {
  id: string
  slug?: string           // share slug (`${slugify(title)}-${id}`), set by the server
  createdAt?: string
  published?: boolean
  title: string
  summary: string
  description: string
  level: "debutant" | "intermediaire" | "avance"
  format: "en-ligne" | "presentiel" | "hybride"
  durationHours: number
  free: boolean
  price: number
  image?: string
  ogImage?: string        // 1200×630 preview shown when the link is shared
  instructor?: string
  startDate?: string
  seats?: number
  syllabus: string[]
  order?: number
  // Nouveau : type de session
  type?: "cours" | "live" | "conference" | "replay"
  liveUrl?: string        // lien Zoom/Meet/YouTube Live
  replayUrl?: string      // URL vidéo (YouTube embed ou mp4)
  resourcesUrl?: string   // PDF des ressources téléchargeables
  startDateTime?: string  // ISO 8601 — pour les lives/conférences
  endDateTime?: string
  isLive?: boolean        // true si la session est actuellement en cours
  recordingDate?: string  // date d'enregistrement (replays)
  tags?: string[]
}

// ── Éventualités (journal d'incidents admin) ──────────────────────────────────
export interface Eventualite {
  id: string
  createdAt: string
  title: string
  description?: string
  type: "incident" | "alerte" | "note" | "suivi_client" | "paiement"
  severity: "critique" | "haute" | "normale" | "info"
  status: "ouverte" | "en_cours" | "resolue" | "archivee"
  linkedLeadId?: string
  resolvedAt?: string
  resolvedNote?: string
  tags?: string[]
}
export interface EventualiteInput {
  title: string
  description?: string
  type: Eventualite["type"]
  severity: Eventualite["severity"]
  linkedLeadId?: string
  tags?: string[]
}
export interface EnrollInput {
  formationId: string
  name: string
  email: string
  phone?: string
  message?: string
  lang?: string
  currency?: string
  region?: string
}

// ── Collaborateurs (espace Collaborateur) ──────────────────────────────────────
export interface Collaborateur {
  id: string
  createdAt: string
  status?: "pending" | "approved"
  name: string
  profession: string
  service: string
  description: string
  price: string
  city?: string
  photoUrl?: string
  phone?: string
  email?: string
  whatsapp?: string
  instagram?: string
  website?: string
  accent?: string
}
export type PublicCollaborateur = Omit<Collaborateur, "status" | "email" | "phone">
export interface CollaborateurInput {
  name: string
  profession: string
  service: string
  description: string
  price: string
  city?: string
  photoUrl?: string
  phone?: string
  email?: string
  whatsapp?: string
  instagram?: string
  website?: string
  accent?: string
  testimonial?: string
  portfolioImages?: string[]
  skills?: string[]
}

// ── Public API (site → server) ────────────────────────────────────────────────
export const api = {
  // Fire-and-forget lead capture; never blocks the user's WhatsApp/PDF flow.
  // Attaches the ambassador referral code (if any) so the parrain gets credited.
  submitLead(lead: Partial<Lead>) {
    const ref = getStoredRef()
    const withRef: Partial<Lead> = ref
      ? { ...lead, meta: { ...(lead.meta ?? {}), ref } }
      : lead
    return pub<{ ok: boolean; id: string }>("/leads", {
      method: "POST",
      body: JSON.stringify(withRef),
    }).catch((e) => {
      console.info("[lead] capture failed (non-blocking):", e)
      return null
    })
  },
  // Emails the client the proforma they configured (and notifies the team).
  // Attaches the ambassador referral code so the parrain gets credited.
  requestProforma(payload: {
    name: string
    email: string
    phone?: string
    lang: string
    currency: string
    region: string
    proformaNo: string
    total: number
    deposit: number
    items: LeadItem[]
    /** Deprecated: the proforma HTML is now rendered server-side and this field
     *  is ignored by the API. Kept optional for backward compatibility. */
    html?: string
  }) {
    const ref = getStoredRef()
    // Drop the (now unused) client-rendered HTML so we don't ship ~400 KB per request.
    const { html: _ignored, ...clean } = payload
    return pub<{ ok: boolean; id: string }>("/proforma", {
      method: "POST",
      body: JSON.stringify(ref ? { ...clean, meta: { ref } } : clean),
    })
  },
  subscribeNewsletter(email: string, lang: string) {
    return pub<{ ok: boolean }>("/newsletter", {
      method: "POST",
      body: JSON.stringify({ email, lang }),
    })
  },
  // Emails the free guide (download link) to the visitor; non-blocking.
  sendGuide(email: string, lang: string) {
    return pub<{ ok: boolean }>("/guide", {
      method: "POST",
      body: JSON.stringify({ email, lang }),
    }).catch((e) => {
      console.info("[guide] email send failed (non-blocking):", e)
      return null
    })
  },
  getSettings() {
    return pub<{ settings: SiteSettings }>("/settings")
  },
  // Public: submit a review (stored pending until the admin approves it).
  submitTestimonial(input: TestimonialInput) {
    return pub<{ ok: boolean; id: string }>("/testimonials", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  // Public: approved reviews to display on the site.
  listTestimonials() {
    return pub<{ testimonials: PublicTestimonial[] }>("/testimonials")
  },
  // Requests a one-shot signed upload URL for a brief attachment. The browser
  // then uploads the bytes directly to Storage with uploadToSignedUrl().
  briefUploadUrl(file: { filename: string; contentType: string; size: number }) {
    return pub<{ ok: boolean; path: string; token: string; bucket: string }>("/brief/upload-url", {
      method: "POST",
      body: JSON.stringify(file),
    })
  },
  // Public: published formations for the Formation page.
  listFormations() {
    return pub<{ formations: Formation[] }>("/formations")
  },
  // Public: a single published formation by share slug (or raw id).
  getFormation(slug: string) {
    return pub<{ formation: Formation }>(`/formations/one/${encodeURIComponent(slug)}`)
  },
  // Public: enroll in a formation (records it as a lead for payment tracking).
  enrollFormation(input: EnrollInput) {
    const ref = getStoredRef()
    return pub<{ ok: boolean; id: string; free: boolean }>("/formations/enroll", {
      method: "POST",
      body: JSON.stringify(ref ? { ...input, meta: { ref } } : input),
    })
  },
  // Public: approved collaborators for the public gallery.
  listCollaborateurs() {
    return pub<{ collaborateurs: PublicCollaborateur[] }>("/collaborateurs")
  },
  // Public: submit a collaborator application (stored pending until approved).
  submitCollaborateur(input: CollaborateurInput) {
    return pub<{ ok: boolean; id: string }>("/collaborateurs", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  // Public: signed upload URL for a collaborator photo (public bucket).
  collabUploadUrl(file: { filename: string; contentType: string; size: number }) {
    return pub<{ ok: boolean; path: string; token: string; bucket: string; publicUrl: string }>("/collaborateurs/upload-url", {
      method: "POST",
      body: JSON.stringify(file),
    })
  },
  bootstrapStatus() {
    return pub<{ initialized: boolean }>("/bootstrap-status")
  },
  bootstrap(email: string, password: string) {
    return pub<{ ok: boolean }>("/bootstrap", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
  },
}

// ── Admin API (dashboard → server) ─────────────────────────────────────────────
export const adminApi = {
  listLeads() {
    return auth<{ leads: Lead[] }>("/leads")
  },
  updateLead(id: string, patch: Partial<Lead>) {
    return auth<{ ok: boolean; lead: Lead; receipt?: { sent?: boolean; error?: string } }>(`/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
  },
  deleteLead(id: string) {
    return auth<{ ok: boolean }>(`/leads/${id}`, { method: "DELETE" })
  },
  listSubscribers() {
    return auth<{ subscribers: Subscriber[] }>("/newsletter")
  },
  deleteSubscriber(email: string) {
    return auth<{ ok: boolean }>(`/newsletter/${encodeURIComponent(email)}`, {
      method: "DELETE",
    })
  },
  // Send a newsletter campaign now (or a test to a single address).
  sendNewsletter(payload: { subject: string; html: string; lang?: string; test?: boolean; testEmail?: string }) {
    return auth<{ ok: boolean; sent: number; failed: number; errors: string[] }>("/newsletter/send", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  // Schedule a newsletter campaign for automatic dispatch at scheduledAt.
  scheduleNewsletter(payload: { subject: string; html: string; lang?: string; scheduledAt: string }) {
    return auth<{ ok: boolean; id: string }>("/newsletter/schedule", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  listCampaigns() {
    return auth<{ campaigns: Campaign[] }>("/newsletter/campaigns")
  },
  deleteCampaign(id: string) {
    return auth<{ ok: boolean }>(`/newsletter/campaigns/${id}`, { method: "DELETE" })
  },
  getSettings() {
    return auth<{ settings: SiteSettings }>("/settings")
  },
  // Moderation queue: every review (pending + approved), newest first.
  listTestimonials() {
    return auth<{ testimonials: Testimonial[] }>("/testimonials/all")
  },
  approveTestimonial(id: string) {
    return auth<{ ok: boolean; testimonial: Testimonial }>(`/testimonials/${id}/approve`, {
      method: "PATCH",
    })
  },
  deleteTestimonial(id: string) {
    return auth<{ ok: boolean }>(`/testimonials/${id}`, { method: "DELETE" })
  },
  // Short-lived signed URL to view/download a client-uploaded brief attachment.
  briefFileUrl(path: string) {
    return auth<{ ok: boolean; url: string }>("/brief/file-url", {
      method: "POST",
      body: JSON.stringify({ path }),
    })
  },
  // Permanently delete a client-uploaded attachment from Storage (and, given the
  // lead id, remove it from that lead's meta) to free stored data.
  briefFileDelete(path: string, id?: string) {
    return auth<{ ok: boolean }>("/brief/file-delete", {
      method: "POST",
      body: JSON.stringify({ path, id }),
    })
  },
  saveSettings(settings: SiteSettings) {
    return auth<{ ok: boolean; settings: SiteSettings }>("/settings", {
      method: "PUT",
      body: JSON.stringify(settings),
    })
  },
  // ── TikTok (auto-publication) ──
  tiktokStatus() {
    return auth<{ configured: boolean; connected: boolean; openId: string | null; expiresAt: number | null; redirectUri: string }>(
      "/tiktok/status",
    )
  },
  tiktokAuthUrl() {
    return auth<{ url: string }>("/tiktok/auth")
  },
  tiktokDisconnect() {
    return auth<{ ok: boolean }>("/tiktok/disconnect", { method: "POST" })
  },
  // Publish (or schedule) a post; add "tiktok" to networks and pass videoUrl to post a video.
  publishSocial(payload: { caption: string; imageUrl?: string; videoUrl?: string; link?: string; networks?: string[] }) {
    return auth<{ ok: boolean; id: string; status: string; result: Record<string, unknown> }>("/social/publish", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  // Emails a delivery note (bon de livraison) to the client (Gmail SMTP) and
  // records it as a "delivery" lead so it shows up in the dashboard.
  sendDelivery(payload: {
    name: string
    email: string
    currency: string
    deliveryNo: string
    total: number | null
    items: LeadItem[]
    html: string
    meta?: Record<string, unknown>
  }) {
    return auth<{ ok: boolean; id: string }>("/delivery", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },
  // Emails the branded receipt for a lead/payment to the client (Gmail SMTP).
  sendReceipt(id: string, subject?: string) {
    return auth<{ ok: boolean; sentTo: string }>(`/receipt/${id}/send`, {
      method: "POST",
      body: JSON.stringify({ subject: subject ?? "" }),
    })
  },
  // ── Formations ────────────────────────────────────────────────────────────
  listFormations() {
    return auth<{ formations: Formation[] }>("/formations/all")
  },
  // Create (no id) or update (with id) a formation.
  saveFormation(f: Partial<Formation> & { title: string }) {
    return auth<{ ok: boolean; formation: Formation }>("/formations", {
      method: "POST",
      body: JSON.stringify(f),
    })
  },
  deleteFormation(id: string) {
    return auth<{ ok: boolean }>(`/formations/${id}`, { method: "DELETE" })
  },
  // Enrollments = leads with source "formation" (for the "suivi des inscrits" view).
  listEnrollments() {
    return auth<{ enrollments: Lead[] }>("/formations/enrollments")
  },

  // ── Collaborateurs ────────────────────────────────────────────────────────
  listCollaborateurs() {
    return auth<{ collaborateurs: Collaborateur[] }>("/collaborateurs/all")
  },
  approveCollaborateur(id: string) {
    return auth<{ ok: boolean; collaborateur: Collaborateur }>(`/collaborateurs/${id}/approve`, {
      method: "PATCH",
    })
  },
  deleteCollaborateur(id: string) {
    return auth<{ ok: boolean }>(`/collaborateurs/${id}`, { method: "DELETE" })
  },

  // ── Éventualités (journal d'incidents) ───────────────────────────────────
  listEventualites() {
    return auth<{ eventualites: Eventualite[] }>("/eventualites")
  },
  createEventualite(input: EventualiteInput) {
    return auth<{ ok: boolean; eventualite: Eventualite }>("/eventualites", {
      method: "POST",
      body: JSON.stringify(input),
    })
  },
  updateEventualite(id: string, patch: Partial<Pick<Eventualite, "status" | "resolvedNote" | "description" | "severity">>) {
    return auth<{ ok: boolean; eventualite: Eventualite }>(`/eventualites/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    })
  },
  deleteEventualite(id: string) {
    return auth<{ ok: boolean }>(`/eventualites/${id}`, { method: "DELETE" })
  },

  // AI assistant (Gemini). Sends the running conversation; optionally grounds the
  // answer in a snapshot of recent leads. No step-up: it does not change any data.
  assistant(messages: AssistantMessage[], withLeads = false) {
    return authChat<{ ok: boolean; reply: string }>("/assistant", {
      method: "POST",
      body: JSON.stringify({ messages, withLeads }),
    })
  },
}
