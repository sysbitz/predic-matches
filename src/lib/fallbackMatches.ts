import type { Match } from "./teams";

/**
 * Manual match fixtures fallback.
 *
 * Used automatically when the live matches API (`get-matches` edge function) fails.
 * You (or the admin) can edit this file to add MegaCup 2026 fixtures by hand.
 *
 * Schema notes:
 *  - `id` must be unique per match (number).
 *  - `home_team_country` / `away_team_country` use FIFA 3-letter codes
 *    (see `src/lib/teams.ts` -> `fifaToIso2` for supported codes; add more there if needed).
 *  - `status`: "future_scheduled" | "in_progress" | "completed"
 *  - `datetime`: ISO 8601 UTC timestamp.
 *  - For not-yet-played matches keep `goals: 0` and `status: "future_scheduled"`.
 *  - `stage_name` examples: "First stage", "Round of 16", "Quarter-final",
 *    "Semi-final", "Play-off for third place", "Final".
 */
export const FALLBACK_MATCHES: Match[] = [
  {
    id: 1001,
    venue: "Lusail Stadium",
    location: "Lusail",
    status: "future_scheduled",
    stage_name: "First stage",
    home_team_country: "ARG",
    away_team_country: "BRA",
    datetime: "2026-06-12T18:00:00Z",
    winner: "",
    winner_code: "",
    home_team: { country: "ARG", name: "Argentina", goals: 0, penalties: 0 },
    away_team: { country: "BRA", name: "Brazil", goals: 0, penalties: 0 },
  },
  {
    id: 1002,
    venue: "Wembley Stadium",
    location: "London",
    status: "future_scheduled",
    stage_name: "First stage",
    home_team_country: "ENG",
    away_team_country: "FRA",
    datetime: "2026-06-13T19:00:00Z",
    winner: "",
    winner_code: "",
    home_team: { country: "ENG", name: "England", goals: 0, penalties: 0 },
    away_team: { country: "FRA", name: "France", goals: 0, penalties: 0 },
  },
  {
    id: 1003,
    venue: "Allianz Arena",
    location: "Munich",
    status: "future_scheduled",
    stage_name: "First stage",
    home_team_country: "GER",
    away_team_country: "ESP",
    datetime: "2026-06-14T17:00:00Z",
    winner: "",
    winner_code: "",
    home_team: { country: "GER", name: "Germany", goals: 0, penalties: 0 },
    away_team: { country: "ESP", name: "Spain", goals: 0, penalties: 0 },
  },
];
