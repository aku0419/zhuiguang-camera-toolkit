// Google 登入（Supabase Auth）。做法跟初光一樣：網頁上的登入牆，沒登入就送去 /login/。
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_KEY;
export const configured = Boolean(url && key);

export const sb = configured
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" } })
  : null;

export async function currentUser() {
  if (!sb) return null;
  const { data } = await sb.auth.getSession();
  return data.session?.user || null;
}

export async function signInWithGoogle(next) {
  try { if (next) sessionStorage.setItem("zg-after-login", next); } catch (e) {}
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: location.origin + "/login/", queryParams: { prompt: "select_account" } },
  });
  if (error) throw error;
}

export async function signOut() {
  await sb.auth.signOut();
  location.href = "/login/";
}

// 只允許站內路徑，避免被帶去別的網站
export function safeNext(p) {
  return typeof p === "string" && /^\/(?!\/)/.test(p) && !p.startsWith("/login") ? p : "/";
}
