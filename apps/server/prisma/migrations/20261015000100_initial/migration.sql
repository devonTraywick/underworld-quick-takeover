CREATE TYPE "RoomStatus" AS ENUM ('LOBBY', 'ACTIVE', 'FINALE', 'CLOSED');

CREATE TABLE "Room" (
  "id" UUID NOT NULL,
  "code" VARCHAR(6) NOT NULL,
  "status" "RoomStatus" NOT NULL DEFAULT 'LOBBY',
  "hostPlayerId" UUID,
  "capacity" INTEGER NOT NULL DEFAULT 8,
  "snapshot" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "deadlineAt" TIMESTAMP(3),
  "leaseOwner" TEXT,
  "leaseUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Room_code_key" ON "Room"("code");
CREATE INDEX "Room_status_deadlineAt_idx" ON "Room"("status", "deadlineAt");

CREATE TABLE "Player" (
  "id" UUID NOT NULL,
  "roomId" UUID NOT NULL,
  "seat" INTEGER NOT NULL,
  "nickname" VARCHAR(20) NOT NULL,
  "reconnectTokenHash" VARCHAR(64) NOT NULL,
  "connected" BOOLEAN NOT NULL DEFAULT false,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Player_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "Player_roomId_seat_key" ON "Player"("roomId", "seat");
CREATE UNIQUE INDEX "Player_roomId_nickname_key" ON "Player"("roomId", "nickname");

CREATE TABLE "MatchEvent" (
  "id" BIGSERIAL NOT NULL,
  "roomId" UUID NOT NULL,
  "sequence" INTEGER NOT NULL,
  "commandId" VARCHAR(64),
  "actorId" UUID,
  "type" VARCHAR(64) NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "MatchEvent_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "MatchEvent_roomId_sequence_key" ON "MatchEvent"("roomId", "sequence");
CREATE UNIQUE INDEX "MatchEvent_roomId_commandId_actorId_key" ON "MatchEvent"("roomId", "commandId", "actorId");

CREATE TABLE "ChatMessage" (
  "id" UUID NOT NULL,
  "roomId" UUID NOT NULL,
  "playerId" UUID NOT NULL,
  "body" VARCHAR(280) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ChatMessage_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE
);
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");
