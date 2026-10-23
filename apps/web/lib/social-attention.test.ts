import { describe, expect, it } from "vitest";
import { deriveSocialActivity, type SeenState } from "./social-attention";
import type { PrivateState, PublicState } from "./types";

const emptySeen: SeenState = { publicIds: [], privateIds: [], dealKeys: [], dismissedKeys: [], objectiveRound: 0 };
const state = {
  room: { code: "NOIR88", chats: [{ id: "pub-1", playerId: "rival", nickname: "Crimson", body: "The docks are watched.", createdAt: 1 }], players: [{ id: "me", nickname: "Velvet", seat: 0 }, { id: "rival", nickname: "Crimson", seat: 1 }] },
  game: { round: 2, players: [{ id: "me", nickname: "Velvet", seat: 0 }, { id: "rival", nickname: "Crimson", seat: 1 }] },
} as unknown as PublicState;
const privateState = {
  privateMessages: [
    { id: "priv-1", playerId: "rival", recipientId: "me", nickname: "Crimson", body: "Meet me in the Old Quarter.", createdAt: 2 },
    { id: "priv-2", playerId: "me", recipientId: "rival", nickname: "Velvet", body: "Name the terms.", createdAt: 3 },
  ],
  deals: [{ id: "deal-1", round: 2, type: "non-aggression", proposerId: "rival", recipientId: "me", terms: {}, status: "pending" }],
} as unknown as PrivateState;

describe("social attention projection", () => {
  it("prioritizes an incoming deal over private and public activity", () => {
    const result = deriveSocialActivity(state, privateState, "me", emptySeen);
    expect(result.notices.map((notice) => notice.kind)).toEqual(["deal-proposed", "private", "public"]);
    expect(result.notices[0]?.summary).toContain("Crimson");
  });

  it("does not count outgoing private messages and deduplicates acknowledged projections", () => {
    const seen = { ...emptySeen, publicIds: ["pub-1"], privateIds: ["priv-1"], dealKeys: ["deal:deal-1:pending"] };
    const result = deriveSocialActivity(state, privateState, "me", seen);
    expect(result.notices).toEqual([]);
    expect(result.privateIncoming.map((message) => message.id)).toEqual(["priv-1"]);
  });

  it("only derives private notices from the player's authorized private projection", () => {
    const outsiderProjection = { ...privateState, privateMessages: [] } as PrivateState;
    const result = deriveSocialActivity(state, outsiderProjection, "me", emptySeen);
    expect(result.notices.some((notice) => notice.kind === "private")).toBe(false);
  });

  it("creates new status events for accepted, rejected, cancelled, and expired deals", () => {
    const base = privateState.deals[0]!;
    const variations = [
      { ...base, proposerId: "me", recipientId: "rival", status: "accepted" as const },
      { ...base, id: "deal-2", proposerId: "me", recipientId: "rival", status: "rejected" as const },
      { ...base, id: "deal-3", status: "withdrawn" as const },
      { ...base, id: "deal-4", round: 1, status: "pending" as const },
    ];
    const result = deriveSocialActivity(state, { ...privateState, deals: variations } as PrivateState, "me", { ...emptySeen, publicIds: ["pub-1"], privateIds: ["priv-1"] });
    expect(result.notices.map((notice) => notice.kind)).toEqual(["deal-accepted", "deal-rejected", "deal-cancelled", "deal-expired"]);
  });
});
