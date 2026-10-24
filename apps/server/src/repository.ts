import type { RoomRecord, RoomRepository } from "./types.js";

export class VersionConflictError extends Error {}

export class MemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, RoomRecord>();
  private readonly leases = new Map<string, { owner: string; until: number }>();

  async create(room: RoomRecord): Promise<void> {
    if (this.rooms.has(room.code)) throw new Error("Room code already exists");
    this.rooms.set(room.code, structuredClone(room));
  }

  async getByCode(code: string): Promise<RoomRecord | null> {
    const room = this.rooms.get(code);
    return room ? structuredClone(room) : null;
  }

  async save(room: RoomRecord, expectedVersion: number): Promise<void> {
    const current = this.rooms.get(room.code);
    if (!current || current.version !== expectedVersion) throw new VersionConflictError("Stale room version");
    const next = structuredClone(room);
    next.version = expectedVersion + 1;
    this.rooms.set(room.code, next);
    room.version = next.version;
  }

  async due(now: number): Promise<string[]> {
    return [...this.rooms.values()]
      .filter((room) => room.deadlineAt !== null && room.deadlineAt <= now && room.status === "active")
      .filter((room) => (this.leases.get(room.code)?.until ?? 0) <= now)
      .map((room) => room.code);
  }

  async claimDue(code: string, owner: string, now: number, leaseMs: number): Promise<boolean> {
    const room = this.rooms.get(code);
    const lease = this.leases.get(code);
    if (!room || room.deadlineAt === null || room.deadlineAt > now || (lease && lease.until > now && lease.owner !== owner)) return false;
    this.leases.set(code, { owner, until: now + leaseMs });
    return true;
  }

  async releaseClaim(code: string, owner: string): Promise<void> {
    if (this.leases.get(code)?.owner === owner) this.leases.delete(code);
  }

  async purgeExpired(now: number): Promise<number> {
    let removed = 0;
    for (const [code, room] of this.rooms) {
      if (room.expiresAt > now) continue;
      this.rooms.delete(code); this.leases.delete(code); removed += 1;
    }
    return removed;
  }

  async close(): Promise<void> {}
}
