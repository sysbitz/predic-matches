import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/teams";
import { FALLBACK_MATCHES } from "@/lib/fallbackMatches";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-matches`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Flip to `true` to ALWAYS use the local fallback file in src/lib/fallbackMatches.ts
// (useful when the live API is down or you want to ship a custom MegaCup 2026 fixture list).
const USE_LOCAL_FALLBACK_ONLY = false;

async function fetchMatches(): Promise<Match[]> {
  if (USE_LOCAL_FALLBACK_ONLY) return FALLBACK_MATCHES;
  try {
    const r = await fetch(FN_URL, {
      headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const data = await r.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error("Empty response");
    return data as Match[];
  } catch (e) {
    console.warn("[useMatches] Live API failed, using local fallback fixtures.", e);
    return FALLBACK_MATCHES;
  }
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 1,
  });
}
