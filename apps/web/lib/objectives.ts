import type { DistrictId, Objective } from "@underworld/shared";

export const OBJECTIVE_NAMES: Record<string, string> = {
  "city-crown": "Control the City", kingmaker: "Kingmaker", "deep-roots": "Deep Roots", untouchable: "Untouchable",
  mastermind: "Mastermind", "shadow-broker": "Shadow Broker", "district-boss": "District Boss",
  "cash-reserve": "Cash Reserve", "citywide-network": "Citywide Network", "wrecking-crew": "Wrecking Crew",
  "honorable-word": "Honorable Word", "reliable-operator": "Reliable Operator", strongholds: "Strongholds",
  "knife-in-the-dark": "Knife in the Dark",
};

export const OBJECTIVE_COPY: Record<string, string> = {
  "city-crown": "Finish the match controlling at least half of all active districts.", kingmaker: "Finish controlling Downtown and at least one other district.",
  "deep-roots": "Build 4 or more stake in the required number of districts.", untouchable: "Finish with at least 7 Influence while controlling a district.",
  mastermind: "Complete a successful qualifying operation in every round.", "shadow-broker": "Complete intelligence or honored-deal events and finish controlling a district.",
  "district-boss": "Control the named district when the final books close.", "cash-reserve": "Finish the match with at least 4 Influence.",
  "citywide-network": "Place at least one stake in the required number of districts.", "wrecking-crew": "Succeed with Sabotage in two different rounds.",
  "honorable-word": "Honor at least two accepted agreements.", "reliable-operator": "Complete successful qualifying operations in four rounds.",
  strongholds: "Build at least 3 stake in two districts.", "knife-in-the-dark": "Break an accepted deal and finish with at least 2 Influence.",
};

const DISTRICTS: Record<DistrictId, string> = { downtown: "Downtown", docks: "The Docks", "old-quarter": "Old Quarter", "financial-row": "Financial Row", heights: "The Heights", "industrial-yard": "Industrial Yard", "neon-strip": "Neon Strip" };

export function objectiveExplanation(objective: Objective & { target?: number }): string {
  return `${OBJECTIVE_COPY[objective.id] ?? "Complete the classified condition before the match ends."}${objective.districtId ? ` Target: ${DISTRICTS[objective.districtId]}.` : ""}`;
}
