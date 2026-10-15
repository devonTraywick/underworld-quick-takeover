import { Prisma, PrismaClient, RoomStatus as PrismaRoomStatus } from "@prisma/client";
import type { RoomRecord, RoomRepository, RoomStatus } from "./types.js";
import { VersionConflictError } from "./repository.js";

function encode(room: RoomRecord): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(room)) as Prisma.InputJsonValue;
}

function decode(value: Prisma.JsonValue): RoomRecord {
  return value as unknown as RoomRecord;
}

function toPrismaStatus(status: RoomStatus): PrismaRoomStatus {
  return status.toUpperCase() as PrismaRoomStatus;
}

export class PrismaRoomRepository implements RoomRepository {
  constructor(private readonly prisma = new PrismaClient()) {}

  async create(room: RoomRecord): Promise<void> {
    await this.prisma.room.create({
      data: {
        id: room.id,
        code: room.code,
        status: toPrismaStatus(room.status),
        hostPlayerId: room.hostPlayerId,
        capacity: room.capacity,
        snapshot: encode(room),
        version: room.version,
        deadlineAt: room.deadlineAt === null ? null : new Date(room.deadlineAt),
        expiresAt: new Date(room.expiresAt),
        players: {
          create: room.players.map((player) => ({
            id: player.id,
            seat: player.seat,
            nickname: player.nickname,
            reconnectTokenHash: player.reconnectTokenHash,
            connected: player.connected,
            lastSeenAt: new Date(player.lastSeenAt),
          })),
        },
      },
    });
  }

  async getByCode(code: string): Promise<RoomRecord | null> {
    const row = await this.prisma.room.findUnique({ where: { code } });
    return row ? decode(row.snapshot) : null;
  }

  async save(room: RoomRecord, expectedVersion: number): Promise<void> {
    await this.prisma.$transaction(async (transaction) => {
      const updated = await transaction.room.updateMany({
        where: { code: room.code, version: expectedVersion },
        data: {
          status: toPrismaStatus(room.status),
          hostPlayerId: room.hostPlayerId,
          snapshot: encode({ ...room, version: expectedVersion + 1 }),
          version: { increment: 1 },
          deadlineAt: room.deadlineAt === null ? null : new Date(room.deadlineAt),
          expiresAt: new Date(room.expiresAt),
        },
      });
      if (updated.count !== 1) throw new VersionConflictError("Stale room version");
      for (const player of room.players) {
        await transaction.player.upsert({
          where: { id: player.id },
          create: {
            id: player.id,
            roomId: room.id,
            seat: player.seat,
            nickname: player.nickname,
            reconnectTokenHash: player.reconnectTokenHash,
            connected: player.connected,
            lastSeenAt: new Date(player.lastSeenAt),
          },
          update: {
            nickname: player.nickname,
            reconnectTokenHash: player.reconnectTokenHash,
            connected: player.connected,
            lastSeenAt: new Date(player.lastSeenAt),
          },
        });
      }
    });
    room.version = expectedVersion + 1;
  }

  async due(now: number): Promise<string[]> {
    const rows = await this.prisma.room.findMany({
      where: { status: PrismaRoomStatus.ACTIVE, deadlineAt: { lte: new Date(now) },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date(now) } }] },
      select: { code: true },
    });
    return rows.map((row) => row.code);
  }

  async claimDue(code: string, owner: string, now: number, leaseMs: number): Promise<boolean> {
    const result = await this.prisma.room.updateMany({
      where: { code, status: PrismaRoomStatus.ACTIVE, deadlineAt: { lte: new Date(now) },
        OR: [{ leaseUntil: null }, { leaseUntil: { lte: new Date(now) } }, { leaseOwner: owner }] },
      data: { leaseOwner: owner, leaseUntil: new Date(now + leaseMs) },
    });
    return result.count === 1;
  }

  async releaseClaim(code: string, owner: string): Promise<void> {
    await this.prisma.room.updateMany({ where: { code, leaseOwner: owner }, data: { leaseOwner: null, leaseUntil: null } });
  }

  async close(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
