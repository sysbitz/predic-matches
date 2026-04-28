import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Target } from "lucide-react";
import { getUserPredictions } from "@/lib/dummyPredictions";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ total: 0, points: 0, exact: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const compute = () => {
      const preds = getUserPredictions(user.id);
      const total = preds.length;
      const points = preds.reduce((s, x) => s + (x.points_earned ?? 0), 0);
      const exact = preds.filter((x) => x.points_earned === 3).length;
      setStats({ total, points, exact });
      setLoading(false);
    };
    compute();
    window.addEventListener("dummy-predictions-change", compute);
    return () => window.removeEventListener("dummy-predictions-change", compute);
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container max-w-2xl py-12">
        {loading ? (
          <Skeleton className="h-48 rounded-lg" />
        ) : (
          <>
            <div className="rounded-lg border border-border bg-gradient-card p-8 text-center shadow-card">
              <div className="h-20 w-20 rounded-full bg-gradient-gold mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-background">
                {user.display_name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <h1 className="text-2xl font-bold">{user.display_name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-6">
              <Stat icon={Trophy} label="Points" value={stats.points} />
              <Stat icon={Target} label="Predictions" value={stats.total} />
              <Stat icon={Trophy} label="Exact" value={stats.exact} />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4 text-center">
      <Icon className="h-5 w-5 text-primary mx-auto mb-2" />
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
