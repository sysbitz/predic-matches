// FIFA World Cup 2022 country code -> ISO 3166-1 alpha-2 (for flag CDN)
// API uses FIFA 3-letter codes; we map to ISO-2.
export const fifaToIso2: Record<string, string> = {
  QAT: "qa", ECU: "ec", ENG: "gb-eng", IRN: "ir", SEN: "sn", NED: "nl",
  USA: "us", WAL: "gb-wls", ARG: "ar", KSA: "sa", DEN: "dk", TUN: "tn",
  MEX: "mx", POL: "pl", FRA: "fr", AUS: "au", MAR: "ma", CRO: "hr",
  GER: "de", JPN: "jp", ESP: "es", CRC: "cr", BEL: "be", CAN: "ca",
  SUI: "ch", CMR: "cm", URU: "uy", KOR: "kr", POR: "pt", GHA: "gh",
  BRA: "br", SRB: "rs",
};

export function flagUrl(fifaCode: string): string {
  const iso = fifaToIso2[fifaCode] || fifaCode.toLowerCase().slice(0, 2);
  return `https://flagcdn.com/w320/${iso}.png`;
}

export interface Team {
  country: string;
  name: string;
  goals: number;
  penalties: number;
}

export interface Match {
  id: number;
  venue: string;
  location: string;
  status: string;
  attendance?: string;
  stage_name: string;
  home_team_country: string;
  away_team_country: string;
  datetime: string;
  winner: string;
  winner_code: string;
  home_team: Team;
  away_team: Team;
}
