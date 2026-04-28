import { useQuery } from "@tanstack/react-query";
import type { Match } from "@/lib/teams";

async function fetchMatches(): Promise<Match[]> {
  const r = await fetch("https://worldcupjson.net/matches");
  if (!r.ok) throw new Error("Failed to load matches");
  return r.json();
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
