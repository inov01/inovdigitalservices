import { createClient } from "@supabase/supabase-js"
import { projectId, publicAnonKey } from "./supabaseConfig"

// Single browser Supabase client — used for admin auth (login/session).
// Mirrors utils/supabase/client.tsx but reads from supabaseConfig.ts so it
// targets the self-managed project (see supabaseConfig.ts for why).
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
