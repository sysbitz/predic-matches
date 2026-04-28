import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { flagUrl, type Match } from "@/lib/teams";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { getPrediction, savePrediction, scorePrediction } from "@/lib/dummyPredictions";

export function PredictDialog({
  match, open, onOpenChange,
}: { match: Match; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { user } = useAuth();
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [winner, setWinner] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    const existing = getPrediction(user.id, match.id);
    if (existing) {
      setHome(existing.predicted_home_score);
      setAway(existing.predicted_away_score);
      setWinner(existing.predicted_winner);
    } else {
      setHome(0); setAway(0); setWinner(match.home_team.name);
    }
  }, [open, user, match.id]);

  // Auto-derive winner from score
  useEffect(() => {
    if (home > away) setWinner(match.home_team.name);
    else if (away > home) setWinner(match.away_team.name);
    else setWinner("Draw");
  }, [home, away, match]);

  const save = () => {
    if (!user) return;
    setSaving(true);
    try {
      savePrediction({
        user_id: user.id,
        match_id: match.id,
        predicted_home_score: home,
        predicted_away_score: away,
        predicted_winner: winner,
        points_earned: scorePrediction(match, home, away, winner),
        created_at: new Date().toISOString(),
      });
      toast.success("Prediction saved!");
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Your prediction</DialogTitle>
          <DialogDescription>{match.stage_name} • {match.venue}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-3 items-end gap-3">
            <ScoreInput
              code={match.home_team_country}
              name={match.home_team.name}
              value={home}
              onChange={setHome}
            />
            <div className="text-center text-2xl font-bold text-muted-foreground pb-2">–</div>
            <ScoreInput
              code={match.away_team_country}
              name={match.away_team.name}
              value={away}
              onChange={setAway}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Predicted result</Label>
            <RadioGroup value={winner} onValueChange={setWinner} className="grid grid-cols-3 gap-2">
              <RadioOption value={match.home_team.name} />
              <RadioOption value="Draw" />
              <RadioOption value={match.away_team.name} />
            </RadioGroup>
          </div>

          <div className="rounded-md bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
            <p><span className="font-semibold text-foreground">3 pts</span> exact score</p>
            <p><span className="font-semibold text-foreground">1 pt</span> correct winner</p>
          </div>

          <Button onClick={save} disabled={saving} className="w-full" size="lg">
            {saving ? "Saving…" : "Save prediction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScoreInput({ code, name, value, onChange }: { code: string; name: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <img src={flagUrl(code)} alt={name} className="h-10 w-10 rounded-full object-cover ring-2 ring-border" />
      <span className="text-xs font-medium text-center truncate w-full">{name}</span>
      <Input
        type="number"
        min={0}
        max={20}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="text-center text-2xl font-bold h-14 tabular-nums"
      />
    </div>
  );
}

function RadioOption({ value }: { value: string }) {
  return (
    <Label className="flex items-center gap-2 rounded-md border border-border bg-muted/30 px-3 py-2 text-xs cursor-pointer hover:bg-muted/60 transition-colors [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/10">
      <RadioGroupItem value={value} />
      <span className="truncate">{value}</span>
    </Label>
  );
}
