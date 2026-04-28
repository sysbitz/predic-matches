import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const memCache = new Map<number, string>();

export function useMatchBackground(matchId: number, homeTeam: string, awayTeam: string) {
  const [url, setUrl] = useState<string | null>(memCache.get(matchId) ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    if (memCache.has(matchId)) return;

    (async () => {
      // Try cache first
      const { data } = await supabase
        .from("match_backgrounds")
        .select("image_url")
        .eq("match_id", matchId)
        .maybeSingle();
      if (!active) return;
      if (data?.image_url) {
        memCache.set(matchId, data.image_url);
        setUrl(data.image_url);
        return;
      }
      // Generate
      setLoading(true);
      const { data: gen, error } = await supabase.functions.invoke("generate-match-bg", {
        body: { match_id: matchId, home_team: homeTeam, away_team: awayTeam },
      });
      if (!active) return;
      setLoading(false);
      if (!error && gen?.image_url) {
        memCache.set(matchId, gen.image_url);
        setUrl(gen.image_url);
      }
    })();

    return () => { active = false; };
  }, [matchId, homeTeam, awayTeam]);

  return { url, loading };
}
