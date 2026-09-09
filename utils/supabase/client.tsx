import { createClient } from "@supabase/supabase-js"
import { projectId, publicAnonKey } from "./info"

// Single browser Supabase client — used for admin auth (login/session).
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "inov-admin-auth",
    },
  },
)
