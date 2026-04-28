import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, Medal, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Row {
  id: string;
  display_name: string;
  total_points: number;
  avatar_url: string | null;
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, total_points, avatar_url")
        .order("total_points", { ascending: false })
        .limit(100);
      if (active) {
        setRows(data ?? []);
        setLoading(false);
      }
    };
    load();

    const channel = supabase
      .channel("leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "predictions" }, load)
      .subscribe();

    return () => { active = false; supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container py-12">
        <div className="text-center mb-10">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-3" />
          <h1 className="text-4xl font-bold">Live <span className="text-gradient-gold">Leaderboard</span></h1>
          <p className="text-muted-foreground mt-2">Updated in real time.</p>
        </div>

        {loading ? (
          <div className="space-y-2 max-w-2xl mx-auto">
            {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">No predictions yet — be the first!</div>
        ) : (
          <ol className="space-y-2 max-w-2xl mx-auto">
            {rows.map((r, i) => (
              <li
                key={r.id}
                className={`flex items-center gap-4 p-4 rounded-lg border border-border bg-gradient-card transition-all hover:border-primary/40 ${
                  i === 0 ? "shadow-gold border-accent/40" : ""
                }`}
              >
                <RankBadge rank={i + 1} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.display_name}</div>
                </div>
                <div className="text-2xl font-bold text-gradient-primary tabular-nums">{r.total_points}</div>
                <span className="text-xs text-muted-foreground">pts</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="h-7 w-7 text-accent" />;
  if (rank === 2) return <Medal className="h-7 w-7 text-muted-foreground" />;
  if (rank === 3) return <Award className="h-7 w-7 text-orange-400" />;
  return <span className="w-7 text-center font-bold text-muted-foreground tabular-nums">{rank}</span>;
}
