import type { CardType } from "@underworld/shared";

export const CARD_GUIDE: Record<CardType, { name: string; symbol: string; summary: string; target: string; benefit: string; details: string }> = {
  infiltrate: { name: "Infiltrate", symbol: "IN", summary: "Add 2 stakes to a district to increase your control.", target: "Any active district", benefit: "+2 of your stakes", details: "Always succeeds. The district owner is recalculated after every operation resolves." },
  fortify: { name: "Fortify", symbol: "FT", summary: "Add 1 stake and protect 1 of your stakes from Sabotage this round.", target: "Any active district", benefit: "+1 stake and a 1-stake shield", details: "The shield applies before Sabotage and lasts for this round only." },
  sabotage: { name: "Sabotage", symbol: "SB", summary: "Remove up to 2 rival stakes from a district.", target: "A rival with stake in an active district", benefit: "Up to −2 rival stakes", details: "Fortify can protect 1 stake. If no valid rival stake can be removed, you gain 1 Influence but the operation is not successful." },
  "shake-down": { name: "Shake Down", symbol: "SD", summary: "Gain 2 Influence for future deals and tiebreakers.", target: "No target required", benefit: "+2 Influence", details: "Influence does not directly add points. It helps with missions, Double Cross, and final tiebreakers." },
  surveillance: { name: "Surveillance", symbol: "SV", summary: "Privately learn a rival’s card and strongest district.", target: "One rival boss", benefit: "Private intelligence", details: "The report also tells you whether that rival has an accepted deal with you. It never reveals their hidden target before resolution." },
  "double-cross": { name: "Double Cross", symbol: "DX", summary: "Betray an accepted deal to gain up to 3 stakes in a district.", target: "An accepted deal and active district", benefit: "+3 stakes if you can pay 2 Influence", details: "With fewer than 2 Influence it adds 1 stake. Without an accepted deal it becomes a +2-stake fallback and is not a betrayal." },
};

export const SCORE_RULES = [
  ["Primary mission", "10 points"],
  ["Each side objective", "4 points"],
  ["Each controlled district", "2 points"],
  ["Successful operation", "1 point per round"],
] as const;

export const TIEBREAK_COPY = "Ties break by completed primary mission, completed side objectives, controlled districts, Influence, total stake, then fewest betrayed deals. If every tiebreaker is equal, victory is shared.";

export const PHASE_INSTRUCTIONS = {
  negotiation: "Talk to rivals or make a deal. You can skip this step.",
  draft: "Choose one card for your next move.",
  operations: "Choose a target and deploy your card.",
  "cinematic-reveal": "Watch everyone’s moves unfold.",
  "round-results": "See who gained power and prepare for the next round.",
  intermission: "Read the map before the next round begins.",
  finale: "Review the final score and see why the winner prevailed.",
} as const;
