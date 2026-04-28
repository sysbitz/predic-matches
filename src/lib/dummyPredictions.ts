import { QUESTIONS, POINTS_PER_CORRECT } from "./questions";

const PRED_KEY = "dummy_predictions_v2";
const ANS_KEY = "dummy_correct_answers";

// answers: { [questionId]: selectedOption }
export type DummyPrediction = {
  user_id: string;
  user_email: string;
  user_name: string;
  match_id: number;
  answers: Record<string, string>;
  created_at: string;
};

// Per-match correct answers set by admin: { [matchId]: { [questionId]: option } }
export type CorrectAnswers = Record<string, Record<string, string>>;

function readPreds(): DummyPrediction[] {
  try { return JSON.parse(localStorage.getItem(PRED_KEY) || "[]"); } catch { return []; }
}
function writePreds(list: DummyPrediction[]) {
  localStorage.setItem(PRED_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("dummy-predictions-change"));
}

export function getPrediction(userId: string, matchId: number): DummyPrediction | null {
  return readPreds().find((p) => p.user_id === userId && p.match_id === matchId) ?? null;
}
export function getUserPredictions(userId: string): DummyPrediction[] {
  return readPreds().filter((p) => p.user_id === userId);
}
export function getAllPredictions(): DummyPrediction[] {
  return readPreds();
}
export function savePrediction(p: DummyPrediction) {
  const list = readPreds().filter(
    (x) => !(x.user_id === p.user_id && x.match_id === p.match_id)
  );
  list.push(p);
  writePreds(list);
}

// Correct answers (admin)
export function getCorrectAnswers(): CorrectAnswers {
  try { return JSON.parse(localStorage.getItem(ANS_KEY) || "{}"); } catch { return {}; }
}
export function getMatchCorrectAnswers(matchId: number): Record<string, string> {
  return getCorrectAnswers()[String(matchId)] ?? {};
}
export function setMatchCorrectAnswers(matchId: number, answers: Record<string, string>) {
  const all = getCorrectAnswers();
  all[String(matchId)] = answers;
  localStorage.setItem(ANS_KEY, JSON.stringify(all));
  window.dispatchEvent(new Event("dummy-predictions-change"));
}

// Scoring
export function scoreFor(matchId: number, answers: Record<string, string>): number {
  const correct = getMatchCorrectAnswers(matchId);
  if (!Object.keys(correct).length) return 0;
  let score = 0;
  for (const q of QUESTIONS) {
    if (correct[q.id] && correct[q.id] === answers[q.id]) {
      score += POINTS_PER_CORRECT;
    }
  }
  return score;
}

export function userTotalPoints(userId: string): number {
  return getUserPredictions(userId).reduce(
    (s, p) => s + scoreFor(p.match_id, p.answers),
    0
  );
}
