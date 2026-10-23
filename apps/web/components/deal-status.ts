import type { Deal } from "@underworld/shared";

export function dealStatusLabel(deal: Deal, round: number): string {
  if (deal.status === "pending" && deal.round < round) return "Expired";
  if (deal.status === "pending") return "Awaiting response";
  if (deal.status === "accepted") return "Active agreement";
  if (deal.status === "rejected") return "Declined";
  if (deal.status === "withdrawn") return "Cancelled";
  return "Resolved";
}
