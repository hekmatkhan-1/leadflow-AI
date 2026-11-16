/**
 * Server-side check: can accounts actually be created / signed into right now?
 *
 * The app ships pointing at a Supabase project that may be unreachable (dead
 * hostname, revoked key, no network). When it is, the auth pages must say so
 * plainly instead of throwing or pretending a signup worked.
 *
 * The probe hits Supabase's public health endpoint with a short timeout and
 * caches the answer briefly, so a dead backend does not add latency to every
 * request.
 */

const PROBE_TIMEOUT_MS = 1500;
const CACHE_TTL_MS = 30_000;

type CachedAvailability = { checkedAt: number; available: boolean };

let cache: CachedAvailability | null = null;

export const ACCOUNTS_CLOSED_MESSAGE =
  "Accounts aren't open yet. We're still connecting the database that stores accounts, so no account can be created or signed into right now. Nothing was submitted.";

export async function areAccountsAvailable(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return false;

  if (cache && Date.now() - cache.checkedAt < CACHE_TTL_MS) {
    return cache.available;
  }

  let available = false;
  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/health`, {
      headers: { apikey: anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
    });
    available = response.ok;
  } catch {
    // Unreachable host, DNS failure, timeout — treat as "not open".
    available = false;
  }

  cache = { checkedAt: Date.now(), available };
  return available;
}
