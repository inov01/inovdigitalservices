import { projectId, publicAnonKey } from "./supabaseConfig"
import { supabase } from "./supabaseClient"

// Client-accounts + ambassador (referral) program.
// Targets the dedicated `accounts` edge function so the main lead function
// is never touched. It reads the shared lead:* KV data and manages its own keys.
const BASE = `https://${projectId}.supabase.co/functions/v1/accounts`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function req<T>(path: string, init: RequestInit = {}, useAuth = false): Promise<T> {
  let token = publicAnonKey
  if (useAuth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.access_token) throw new Error("Not authenticated")
    token = data.session.access_token
  }
  // The accounts edge function can cold-start or drop a request transiently,
  // which used to surface as "ambassador link could not be loaded". GET calls
  // are idempotent, so retry them a couple of times with a short backoff before
  // giving up; mutations (POST etc.) are sent once to stay safe.
  const method = (init.method ?? "GET").toUpperCase()
  const maxAttempts = method === "GET" ? 3 : 1
  let lastErr: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(init.headers ?? {}),
        },
      })
      // Retry transient server errors (5xx); surface client errors immediately.
      if (!res.ok) {
        if (res.status >= 500 && attempt < maxAttempts) {
          lastErr = new Error(`${res.status} ${await res.text()}`)
          await sleep(400 * attempt)
          continue
        }
        throw new Error(`${res.status} ${await res.text()}`)
      }
      return res.json() as Promise<T>
    } catch (err) {
      // Network failure — retry GETs, otherwise rethrow.
      lastErr = err
      if (attempt >= maxAttempts) throw err
      await sleep(400 * attempt)
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Request failed")
}

export interface RefConfig {
  enabled: boolean
  type: "percent" | "fixed"
  value: number
  currency: string
}
export interface Profile {
  userId: string
  email: string
  refCode: string
  isAmbassador: boolean
  createdAt: string
}
export interface AccountOrder {
  id: string
  createdAt: string
  status: string
  source: string
  total: number | null
  currency: string
  items?: { name: string; qty: number; price: number }[]
  message?: string
}
export interface ReferralRow {
  id: string
  createdAt: string
  status: string
  source: string
  total: number | null
  currency: string
}
export interface ReferralStats {
  total: number
  confirmed: number
  credit: number
  currency: string
}

export const accountsApi = {
  getConfig() {
    return req<{ config: RefConfig }>("/config")
  },
  me() {
    return req<{ profile: Profile }>("/me", {}, true)
  },
  becomeAmbassador() {
    return req<{ ok: boolean; profile: Profile }>(
      "/me/ambassador",
      { method: "POST" },
      true,
    )
  },
  myOrders() {
    return req<{ orders: AccountOrder[] }>("/me/orders", {}, true)
  },
  myReferrals() {
    return req<{ referrals: ReferralRow[]; stats: ReferralStats; config: RefConfig }>(
      "/me/referrals",
      {},
      true,
    )
  },
}
