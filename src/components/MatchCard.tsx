import { useState } from "react";
import { format } from "date-fns";
import { MapPin, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { flagUrl, type Match } from "@/lib/teams";
import { useMatchBackground } from "@/hooks/useMatchBackground";
import { PredictDialog } from "./PredictDialog";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

export function MatchCard({ match }: { match: Match }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { url: bg, loading } = useMatchBackground(
    match.id,
    match.home_team.name,
    match.away_team.name
  );

  const isCompleted = match.status === "completed";
  const isLive = match.status === "in_progress";

  return (
    <article className="group relative overflow-hidden rounded-lg border border-border bg-gradient-card shadow-card transition-all duration-300 hover:shadow-glow hover:-translate-y-1 animate-fade-up">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        {bg ? (
          <img
            src={bg}
            alt=""
            loading="lazy"
            className="w-full h-full object-cover opacity-40 group-hover:opacity-55 transition-opacity duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-pitch" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/80 to-card/30" />
      </div>

      <div className="relative z-10 p-5 flex flex-col gap-4">
        {/* Stage / status */}
        <div className="flex items-center justify-between text-xs">
          <Badge variant="secondary" className="font-medium">
            {match.stage_name}
          </Badge>
          {isLive && (
            <Badge className="bg-destructive text-destructive-foreground animate-pulse-glow">
              LIVE
            </Badge>
          )}
          {isCompleted && (
            <Badge variant="outline" className="border-primary/40 text-primary">
              FT
            </Badge>
          )}
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-3">
          <TeamSide code={match.home_team_country} name={match.home_team.name} />
          <div className="flex flex-col items-center gap-1 px-2">
            {isCompleted ? (
              <div className="text-3xl font-bold text-gradient-gold tabular-nums">
                {match.home_team.goals} – {match.away_team.goals}
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">vs</div>
            )}
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {format(new Date(match.datetime), "MMM d, HH:mm")}
            </span>
          </div>
          <TeamSide code={match.away_team_country} name={match.away_team.name} align="right" />
        </div>

        {/* Venue */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span className="truncate">{match.venue}, {match.location}</span>
        </div>

        {/* Action */}
        <div className="flex gap-2">
          {user ? (
            <Button
              onClick={() => setOpen(true)}
              size="sm"
              className="flex-1 gap-2"
              variant={isCompleted ? "secondary" : "default"}
            >
              <Sparkles className="h-4 w-4" />
              {isCompleted ? "View prediction" : "Predict"}
            </Button>
          ) : (
            <Link to="/auth" className="flex-1">
              <Button size="sm" variant="outline" className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Sign in to predict
              </Button>
            </Link>
          )}
        </div>

        {loading && !bg && (
          <div className="absolute top-2 right-2 text-[10px] text-muted-foreground/60 animate-pulse">
            generating art…
          </div>
        )}
      </div>
    </article>
  );
}

function TeamSide({ code, name, align = "left" }: { code: string; name: string; align?: "left" | "right" }) {
  return (
    <div className={`flex flex-col items-center gap-2 flex-1 min-w-0 ${align === "right" ? "order-1" : ""}`}>
      <div className="relative h-14 w-14 rounded-full overflow-hidden ring-2 ring-border bg-muted shadow-lg">
        <img
          src={flagUrl(code)}
          alt={`${name} flag`}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-sm font-semibold text-center truncate w-full">{name}</span>
    </div>
  );
}
