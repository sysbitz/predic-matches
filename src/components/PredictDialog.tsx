import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type Match } from "@/lib/teams";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { QUESTIONS } from "@/lib/questions";
import { getPrediction, savePrediction, getMatchCorrectAnswers } from "@/lib/dummyPredictions";
import { CheckCircle2, XCircle } from "lucide-react";

export function PredictDialog({
  match, open, onOpenChange,
}: { match: Match; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const correct = getMatchCorrectAnswers(match.id);
  const hasResult = Object.keys(correct).length > 0;

  useEffect(() => {
    if (!open || !user) return;
    const existing = getPrediction(user.id, match.id);
    setAnswers(existing?.answers ?? {});
  }, [open, user, match.id]);

  const allAnswered = QUESTIONS.every((q) => answers[q.id]);

  const save = () => {
    if (!user) return;
    if (!allAnswered) {
      toast.error("সব প্রশ্নের উত্তর দিন");
      return;
    }
    setSaving(true);
    try {
      savePrediction({
        user_id: user.id,
        user_email: user.email,
        user_name: user.display_name,
        match_id: match.id,
        answers,
        created_at: new Date().toISOString(),
      });
      toast.success("আপনার অনুমান সংরক্ষিত হয়েছে!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "সংরক্ষণ ব্যর্থ");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>আপনার অনুমান</DialogTitle>
          <DialogDescription>
            {match.home_team.name} বনাম {match.away_team.name}
            {hasResult && " • ফলাফল প্রকাশিত"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {QUESTIONS.map((q) => {
            const userAns = answers[q.id];
            const rightAns = correct[q.id];
            return (
              <div key={q.id} className="space-y-2">
                <Label className="text-sm font-semibold">{q.text}</Label>
                <RadioGroup
                  value={userAns ?? ""}
                  onValueChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
                  disabled={hasResult}
                  className="grid grid-cols-2 gap-2"
                >
                  {q.options.map((opt) => {
                    const isUser = userAns === opt;
                    const isRight = rightAns === opt;
                    const isWrongUser = hasResult && isUser && !isRight;
                    return (
                      <Label
                        key={opt}
                        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs cursor-pointer transition-colors
                          ${isRight ? "border-green-500/60 bg-green-500/10" : ""}
                          ${isWrongUser ? "border-destructive/60 bg-destructive/10" : ""}
                          ${!hasResult && isUser ? "border-primary bg-primary/10" : ""}
                          ${!hasResult ? "hover:bg-muted/60" : ""}
                          ${!hasResult && !isUser ? "border-border bg-muted/30" : ""}
                        `}
                      >
                        <RadioGroupItem value={opt} />
                        <span className="truncate flex-1">{opt}</span>
                        {hasResult && isRight && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                        {hasResult && isWrongUser && <XCircle className="h-4 w-4 text-destructive" />}
                      </Label>
                    );
                  })}
                </RadioGroup>
              </div>
            );
          })}

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground">
            প্রতিটি সঠিক উত্তরের জন্য <span className="font-semibold text-foreground">২ পয়েন্ট</span>
          </div>

          {!hasResult && (
            <Button onClick={save} disabled={saving} className="w-full" size="lg">
              {saving ? "সংরক্ষণ হচ্ছে…" : "অনুমান সংরক্ষণ করুন"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
