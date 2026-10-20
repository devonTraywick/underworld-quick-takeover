import { z } from "zod";

export const nicknameSchema = z.string().trim().min(2).max(20).transform((value) => value.normalize("NFKC"));
export const commandIdSchema = z.string().min(8).max(64).regex(/^[a-zA-Z0-9_-]+$/);
export const roomCodeSchema = z.string().trim().toUpperCase().regex(/^[A-HJ-NP-Z2-9]{6}$/);

export const createRoomSchema = z.object({ commandId: commandIdSchema, nickname: nicknameSchema }).strict();
export const joinRoomSchema = z.object({ commandId: commandIdSchema, roomCode: roomCodeSchema, nickname: nicknameSchema }).strict();
export const resumeRoomSchema = z.object({ roomCode: roomCodeSchema, playerId: z.uuid(), reconnectToken: z.string().min(32).max(256) }).strict();
export const baseCommandSchema = z.object({ commandId: commandIdSchema, expectedStateVersion: z.number().int().nonnegative() }).strict();
export const draftCommandSchema = baseCommandSchema.extend({ cardIds: z.array(z.string().min(1).max(80)).max(10) }).strict();
export const operationCommandSchema = baseCommandSchema.extend({
  choice: z.object({
    cardId: z.string().min(1).max(80),
    districtId: z.enum(["downtown", "docks", "old-quarter", "financial-row", "heights", "industrial-yard", "neon-strip"]).optional(),
    targetPlayerId: z.uuid().optional(),
    dealId: z.string().min(1).max(80).optional(),
  }).strict(),
}).strict();
export const readyCommandSchema = baseCommandSchema.extend({ ready: z.boolean() }).strict();
export const chatCommandSchema = baseCommandSchema.extend({ body: z.string().trim().min(1).max(280) }).strict();
export const privateMessageCommandSchema = baseCommandSchema.extend({
  recipientId: z.uuid(),
  body: z.string().trim().min(1).max(280),
}).strict();
export const dealProposeSchema = baseCommandSchema.extend({
  recipientId: z.uuid(),
  type: z.enum(["joint-operation", "non-aggression", "protection-pact"]),
  districtId: z.enum(["downtown", "docks", "old-quarter", "financial-row", "heights", "industrial-yard", "neon-strip"]).optional(),
  protectedPlayerId: z.uuid().optional(),
}).strict();
export const dealRespondSchema = baseCommandSchema.extend({ dealId: z.string().min(1).max(80), accept: z.boolean() }).strict();
export const dealWithdrawSchema = baseCommandSchema.extend({ dealId: z.string().min(1).max(80) }).strict();
export const endMatchVoteSchema = baseCommandSchema.extend({ approve: z.boolean() }).strict();
