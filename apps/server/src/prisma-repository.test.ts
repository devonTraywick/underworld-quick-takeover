import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { PrismaRoomRepository } from "./prisma-repository.js";
import type { RoomRecord } from "./types.js";

const describeDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeDatabase("PrismaRoomRepository", () => {
  it("persists snapshots, players, optimistic versions, and deadline recovery", async () => {
    const repository = new PrismaRoomRepository();
    const now = Date.now();
    const playerId = randomUUID();
    const room: RoomRecord = {
      id: randomUUID(), code: `P${Math.random().toString(36).slice(2, 7).toUpperCase()}`.padEnd(6, "X").slice(0, 6),
      status: "active", hostPlayerId: playerId, capacity: 8,
      players: [{ id: playerId, nickname: "Persistent Boss", seat: 0, reconnectTokenHash: "a".repeat(64), connected: true, lastSeenAt: now }],
      game: null, readyPlayerIds: [], rematchPlayerIds: [], deadlineAt: now - 1, version: 1, processedCommands: {}, chats: [], privateMessages: [],
      createdAt: now, expiresAt: now + 60_000,
    };
    await repository.create(room);
    expect((await repository.getByCode(room.code))?.players[0]?.nickname).toBe("Persistent Boss");
    expect(await repository.due(now)).toContain(room.code);
    expect(await repository.claimDue(room.code, "worker-a", now, 10_000)).toBe(true);
    expect(await repository.claimDue(room.code, "worker-b", now, 10_000)).toBe(false);
    await repository.releaseClaim(room.code, "worker-a");
    room.players[0]!.connected = false;
    await repository.save(room, 1);
    expect(room.version).toBe(2);
    await repository.close();

    const restarted = new PrismaRoomRepository();
    const recovered = await restarted.getByCode(room.code);
    expect(recovered?.version).toBe(2);
    expect(recovered?.players[0]?.connected).toBe(false);
    await restarted.close();
  });
});
