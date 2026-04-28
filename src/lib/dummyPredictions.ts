import type { Match } from "@/lib/teams";

const KEY = "dummy_predictions";

export type DummyPrediction = {
  user_id: string;
  match_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  predicted_winner: string;
  points_earned: number;
  created_at: string;
};

function readAll(): DummyPrediction[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(list: DummyPrediction[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("dummy-predictions-change"));
}

export function getPrediction(userId: string, matchId: number): DummyPrediction | null {
  return readAll().find((p) => p.user_id === userId && p.match_id === matchId) ?? null;
}

export function getUserPredictions(userId: string): DummyPrediction[] {
  return readAll().filter((p) => p.user_id === userId);
}

export function getAllPredictions(): DummyPrediction[] {
  return readAll();
}

export function savePrediction(p: DummyPrediction) {
  const list = readAll().filter(
    (x) => !(x.user_id === p.user_id && x.match_id === p.match_id)
  );
  list.push(p);
  writeAll(list);
}

export function scorePrediction(
  match: Match,
  home: number,
  away: number,
  winner: string
): number {
  if (match.status !== "completed") return 0;
  const exact =
    match.home_team.goals === home && match.away_team.goals === away;
  if (exact) return 3;
  if (match.winner && winner === match.winner) return 1;
  return 0;
}
