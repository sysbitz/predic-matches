import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/teams";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-matches`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function fetchMatches(): Promise<Match[]> {
  const r = await fetch(FN_URL, {
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
    },
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  if (!Array.isArray(data)) throw new Error("Invalid response");
  return data as Match[];
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    retry: 2,
  });
}
