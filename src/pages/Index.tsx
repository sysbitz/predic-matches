import { useMemo, useState } from "react";
import { useMatches } from "@/hooks/useMatches";
import { MatchCard } from "@/components/MatchCard";
import { Header } from "@/components/Header";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy } from "lucide-react";

const PAGE_SIZE = 12;

const STAGES = [
  { id: "all", label: "All" },
  { id: "First stage", label: "Group" },
  { id: "Round of 16", label: "R16" },
  { id: "Quarter-final", label: "QF" },
  { id: "Semi-final", label: "SF" },
  { id: "Play-off for third place", label: "3rd" },
  { id: "Final", label: "Final" },
];

export default function Index() {
  const { data: matches, isLoading, error } = useMatches();
  const [stage, setStage] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!matches) return [];
    return stage === "all" ? matches : matches.filter((m) => m.stage_name === stage);
  }, [matches, stage]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero */}
      <section className="container py-12 sm:py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-4">
          <Trophy className="h-3 w-3" /> FIFA World Cup 2022 — 64 matches
        </div>
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-4">
          Predict every <span className="text-gradient-gold">World Cup</span> match
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Pick winners and exact scores. Earn points. Climb the live leaderboard.
        </p>
      </section>

      {/* Stage tabs */}
      <section className="container">
        <Tabs value={stage} onValueChange={(v) => { setStage(v); setPage(1); }}>
          <TabsList className="flex flex-wrap h-auto bg-card/60 backdrop-blur">
            {STAGES.map((s) => (
              <TabsTrigger key={s.id} value={s.id} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                {s.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </section>

      {/* Grid */}
      <section className="container py-8">
        {error && (
          <div className="text-center py-12 text-destructive">Failed to load matches.</div>
        )}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pageItems.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mt-10">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={safePage === 1 ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }).map((_, i) => {
                const n = i + 1;
                if (totalPages > 7 && n !== 1 && n !== totalPages && Math.abs(n - safePage) > 1) {
                  if (n === 2 || n === totalPages - 1) return <PaginationItem key={n}><span className="px-2 text-muted-foreground">…</span></PaginationItem>;
                  return null;
                }
                return (
                  <PaginationItem key={n}>
                    <PaginationLink
                      isActive={n === safePage}
                      onClick={() => setPage(n)}
                      className="cursor-pointer"
                    >
                      {n}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={safePage === totalPages ? "pointer-events-none opacity-40" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </section>
    </div>
  );
}
