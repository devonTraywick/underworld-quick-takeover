import { describe, expect, it } from "vitest";
import type { Deal } from "@underworld/shared";
import { dealStatusLabel } from "./deal-status";

const pending: Deal = {
  id: "deal-1", round: 1, type: "non-aggression", proposerId: "one", recipientId: "two", terms: {}, status: "pending",
};

describe("mobile deal status language", () => {
  it("marks unanswered proposals from prior rounds as expired", () => {
    expect(dealStatusLabel(pending, 2)).toBe("Expired");
  });

  it("uses clear language for actionable and completed states", () => {
    expect(dealStatusLabel(pending, 1)).toBe("Awaiting response");
    expect(dealStatusLabel({ ...pending, status: "accepted" }, 1)).toBe("Active agreement");
    expect(dealStatusLabel({ ...pending, status: "rejected" }, 1)).toBe("Declined");
    expect(dealStatusLabel({ ...pending, status: "withdrawn" }, 1)).toBe("Cancelled");
  });
});
