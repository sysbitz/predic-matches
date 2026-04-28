import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Trophy, Medal, Award } from "lucide-react";
import { getAllPredictions, scoreFor } from "@/lib/dummyPredictions";

interface Row {
  id: string;
  display_name: string;
  total_points: number;
}

function computeRows(): Row[] {
  const preds = getAllPredictions();
  const map = new Map<string, Row>();
  for (const p of preds) {
    const existing = map.get(p.user_id) ?? {
      id: p.user_id,
      display_name: p.user_name || p.user_email || "User",
      total_points: 0,
    };
    existing.total_points += scoreFor(p.match_id, p.answers);
    map.set(p.user_id, existing);
  }
  return [...map.values()].sort((a, b) => b.total_points - a.total_points);
}

export default function Leaderboard() {
  const [rows, setRows] = useState<Row[]>(() => computeRows());

  useEffect(() => {
    const update = () => setRows(computeRows());
    window.addEventListener("dummy-predictions-change", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("dummy-predictions-change", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container py-12">
        <div className="text-center mb-10">
          <Trophy className="h-12 w-12 text-accent mx-auto mb-3" />
          <h1 className="text-4xl font-bold">লাইভ <span className="text-gradient-gold">লিডারবোর্ড</span></h1>
          <p className="text-muted-foreground mt-2">রিয়েল টাইমে আপডেট</p>
        </div>

        {rows.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">এখনো কোনো অনুমান নেই — প্রথম হোন!</div>
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
                <span className="text-xs text-muted-foreground">পয়েন্ট</span>
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
