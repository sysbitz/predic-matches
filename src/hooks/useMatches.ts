import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Match } from "@/lib/teams";

async function fetchMatches(): Promise<Match[]> {
  const { data, error } = await supabase.functions.invoke("get-matches");
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error("Invalid response");
  return data as Match[];
}

export function useMatches() {
  return useQuery({
    queryKey: ["matches"],
    queryFn: fetchMatches,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
