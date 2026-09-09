import { projectId, publicAnonKey } from "./supabaseConfig"
import { supabase } from "./supabaseClient"

// Client-accounts + ambassador (referral) program.
// Targets the dedicated `accounts` edge function so the main lead function
// is never touched. It reads the shared lead:* KV data and manages its own keys.
const BASE = `https://${projectId}.supabase.co/functions/v1/accounts`

async function req<T>(path: string, init: RequestInit = {}, useAuth = false): Promise<T> {
  let token = publicAnonKey
  if (useAuth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session?.access_token) throw new Error("Not authenticated")
    token = data.session.access_token
  }
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
