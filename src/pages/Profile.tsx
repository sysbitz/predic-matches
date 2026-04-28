import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, Target, CheckCircle2, XCircle, Clock } from "lucide-react";
import { getUserPredictions, getMatchCorrectAnswers, scoreFor } from "@/lib/dummyPredictions";
import { QUESTIONS } from "@/lib/questions";
import { useMatches } from "@/hooks/useMatches";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { data: matches } = useMatches();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    window.addEventListener("dummy-predictions-change", update);
    return () => window.removeEventListener("dummy-predictions-change", update);
  }, []);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const preds = getUserPredictions(user.id);
  const matchById = new Map((matches ?? []).map((m) => [m.id, m]));
  const total = preds.length;
  const totalPoints = preds.reduce((s, p) => s + scoreFor(p.match_id, p.answers), 0);
  const exactCount = preds.reduce((s, p) => {
    const c = getMatchCorrectAnswers(p.match_id);
    if (!Object.keys(c).length) return s;
    const right = QUESTIONS.every((q) => !c[q.id] || c[q.id] === p.answers[q.id]);
    return s + (right ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen" key={tick}>
      <Header />
      <section className="container max-w-3xl py-12">
        <div className="rounded-lg border border-border bg-gradient-card p-8 text-center shadow-card">
          <div className="h-20 w-20 rounded-full bg-gradient-gold mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-background">
            {user.display_name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <h1 className="text-2xl font-bold">{user.display_name}</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-6">
          <Stat icon={Trophy} label="মোট পয়েন্ট" value={totalPoints} />
          <Stat icon={Target} label="মোট অনুমান" value={total} />
          <Stat icon={CheckCircle2} label="পারফেক্ট ম্যাচ" value={exactCount} />
        </div>

        <h2 className="text-xl font-bold mt-10 mb-4">আপনার সব অনুমান</h2>
        {preds.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 border border-dashed border-border rounded-lg">
            এখনো কোনো অনুমান নেই
          </div>
        ) : (
          <Accordion type="single" collapsible className="space-y-2">
            {preds.map((p) => {
              const m = matchById.get(p.match_id);
              const correct = getMatchCorrectAnswers(p.match_id);
              const hasResult = Object.keys(correct).length > 0;
              const score = hasResult ? scoreFor(p.match_id, p.answers) : null;
              return (
                <AccordionItem key={p.match_id} value={String(p.match_id)} className="border border-border rounded-lg bg-card/60 px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-3">
                      <span className="font-semibold text-sm text-left">
                        {m ? `${m.home_team.name} বনাম ${m.away_team.name}` : `ম্যাচ #${p.match_id}`}
                      </span>
                      {hasResult ? (
                        <span className="text-xs font-bold text-primary">{score} পয়েন্ট</span>
                      ) : (
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" /> ফলাফল অপেক্ষমাণ
                        </span>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="space-y-2 pt-2">
                      {QUESTIONS.map((q) => {
                        const userAns = p.answers[q.id] ?? "—";
                        const rightAns = correct[q.id];
                        const isRight = hasResult && rightAns && userAns === rightAns;
                        const isWrong = hasResult && rightAns && userAns !== rightAns;
                        return (
                          <li key={q.id} className="text-xs border-l-2 pl-3 py-1 border-border">
                            <div className="text-muted-foreground mb-0.5">{q.text}</div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isRight ? "text-green-500" : isWrong ? "text-destructive" : ""}`}>
                                আপনার উত্তর: {userAns}
                              </span>
                              {isRight && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                              {isWrong && (
                                <>
                                  <XCircle className="h-3.5 w-3.5 text-destructive" />
                                  <span className="text-green-500">সঠিক: {rightAns}</span>
                                </>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
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
