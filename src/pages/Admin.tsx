import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { useMatches } from "@/hooks/useMatches";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { QUESTIONS } from "@/lib/questions";
import { getMatchCorrectAnswers, setMatchCorrectAnswers } from "@/lib/dummyPredictions";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const ADMIN_PASSWORD = "megacup2026";
const ADMIN_KEY = "admin_authed";

export default function Admin() {
  const { data: matches, isLoading } = useMatches();
  const [matchId, setMatchId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem(ADMIN_KEY) === "1") setAuthed(true);
  }, []);

  const tryLogin = () => {
    if (pw === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_KEY, "1");
      setAuthed(true);
    } else {
      toast.error("ভুল পাসওয়ার্ড");
    }
  };

  if (!authed) {
    return (
      <div className="min-h-screen">
        <Header />
        <section className="container max-w-sm py-20">
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-bold">অ্যাডমিন লগইন</h1>
            <p className="text-sm text-muted-foreground mt-1">পাসওয়ার্ড দিয়ে প্রবেশ করুন</p>
          </div>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="পাসওয়ার্ড"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && tryLogin()}
            />
            <Button onClick={tryLogin} className="w-full" size="lg">প্রবেশ</Button>
          </div>
        </section>
      </div>
    );
  }

  const selectMatch = (id: number) => {
    setMatchId(id);
    setAnswers(getMatchCorrectAnswers(id));
  };

  const save = () => {
    if (!matchId) return;
    setMatchCorrectAnswers(matchId, answers);
    toast.success("সঠিক উত্তর সংরক্ষিত — পয়েন্ট আপডেট হয়েছে");
  };

  const clear = () => {
    if (!matchId) return;
    setMatchCorrectAnswers(matchId, {});
    setAnswers({});
    toast.success("ফলাফল মুছে ফেলা হয়েছে");
  };

  return (
    <div className="min-h-screen">
      <Header />
      <section className="container py-12 max-w-4xl">
        <div className="text-center mb-8">
          <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-3xl font-bold">অ্যাডমিন প্যানেল</h1>
          <p className="text-sm text-muted-foreground mt-1">ম্যাচ শেষ হলে সঠিক উত্তর সেট করুন — সব ব্যবহারকারীর পয়েন্ট স্বয়ংক্রিয়ভাবে গণনা হবে</p>
        </div>

        <div className="grid md:grid-cols-[280px,1fr] gap-6">
          <div className="border border-border rounded-lg bg-card/60 p-3 max-h-[70vh] overflow-y-auto">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3 px-2">ম্যাচ নির্বাচন</h2>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 rounded" />)}
              </div>
            ) : (
              <ul className="space-y-1">
                {(matches ?? []).map((m) => {
                  const has = Object.keys(getMatchCorrectAnswers(m.id)).length > 0;
                  const active = matchId === m.id;
                  return (
                    <li key={m.id}>
                      <button
                        onClick={() => selectMatch(m.id)}
                        className={`w-full text-left px-3 py-2 rounded text-xs transition-colors flex items-center justify-between gap-2
                          ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted/60"}
                        `}
                      >
                        <span className="truncate">{m.home_team.name} বনাম {m.away_team.name}</span>
                        {has && <span className={`text-[10px] ${active ? "text-primary-foreground" : "text-green-500"}`}>✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border border-border rounded-lg bg-card/60 p-5">
            {!matchId ? (
              <div className="text-center text-muted-foreground py-20 text-sm">
                বাম দিক থেকে একটি ম্যাচ নির্বাচন করুন
              </div>
            ) : (
              <>
                <div className="space-y-5 mb-6">
                  {QUESTIONS.map((q) => (
                    <div key={q.id} className="space-y-2">
                      <Label className="text-sm font-semibold">{q.text}</Label>
                      <RadioGroup
                        value={answers[q.id] ?? ""}
                        onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                        className="grid grid-cols-2 gap-2"
                      >
                        {q.options.map((opt) => (
                          <Label
                            key={opt}
                            className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs cursor-pointer hover:bg-muted/60 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10"
                          >
                            <RadioGroupItem value={opt} />
                            <span className="truncate">{opt}</span>
                          </Label>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={save} className="flex-1" size="lg">সঠিক উত্তর সংরক্ষণ</Button>
                  <Button onClick={clear} variant="outline" size="lg">রিসেট</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
