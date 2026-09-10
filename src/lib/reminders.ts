// Rappels & rendez-vous de l'espace administrateur.
//
// Stockés localement (localStorage) pour un usage instantané et sans friction
// (pas de 2FA à chaque ajout). Pour une vraie alarme qui sonne même quand le
// tableau de bord est fermé, chaque rappel peut être exporté en fichier .ics :
// l'événement s'ajoute alors au calendrier du téléphone / Google Agenda avec sa
// propre notification native. Tant que le tableau de bord reste ouvert, une
// notification navigateur est aussi déclenchée à l'échéance.

export type ReminderKind = "rappel" | "rendez-vous" | "relance"

export interface Reminder {
  id: string
  kind: ReminderKind
  title: string
  /** Date/heure d'échéance au format ISO. */
  at: string
  note?: string
  client?: string
  done?: boolean
  /** Empêche de renotifier plusieurs fois pour la même échéance. */
  notified?: boolean
}

const KEY = "inov_admin_reminders_v1"

export function loadReminders(): Reminder[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    return Array.isArray(arr) ? (arr as Reminder[]) : []
  } catch {
    return []
  }
}

export function saveReminders(list: Reminder[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* quota / mode privé — on ignore */
  }
}

export function newReminderId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

const KIND_LABEL: Record<ReminderKind, string> = {
  "rappel": "Rappel",
  "rendez-vous": "Rendez-vous",
  "relance": "Relance client",
}
export function kindLabel(k: ReminderKind): string {
  return KIND_LABEL[k] ?? k
}

// ── Notifications navigateur (tant que le tableau de bord est ouvert) ──────────
export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false
  if (Notification.permission === "granted") return true
  if (Notification.permission === "denied") return false
  const res = await Notification.requestPermission()
  return res === "granted"
}

export function fireNotification(r: Reminder): void {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return
  const body = [r.client ? `Client : ${r.client}` : "", r.note ?? ""].filter(Boolean).join(" — ")
  try {
    new Notification(`${kindLabel(r.kind)} : ${r.title}`, {
      body: body || "C'est l'heure !",
      tag: r.id,
    })
  } catch {
    /* certains navigateurs bloquent hors HTTPS — sans effet */
  }
}

// ── Export calendrier (.ics) — vraie alarme cross-device ───────────────────────
function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
}
function icsEscape(s: string): string {
  return (s ?? "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n")
}

/** Génère le contenu d'un fichier .ics avec une alarme 30 min avant. */
export function reminderToICS(r: Reminder): string {
  const start = new Date(r.at)
  const end = new Date(start.getTime() + 30 * 60 * 1000)
  const desc = [r.client ? `Client : ${r.client}` : "", r.note ?? ""].filter(Boolean).join(" — ")
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//INOV Digital Services//Admin//FR",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${r.id}@inovdigitalservices.com`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(start)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${icsEscape(`${kindLabel(r.kind)} : ${r.title}`)}`,
    desc ? `DESCRIPTION:${icsEscape(desc)}` : "",
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${icsEscape(r.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean).join("\r\n")
}

/** Déclenche le téléchargement du .ics (ouvre le calendrier sur mobile). */
export function downloadICS(r: Reminder): void {
  const blob = new Blob([reminderToICS(r)], { type: "text/calendar;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `rappel-${r.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").slice(0, 40) || "inov"}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
