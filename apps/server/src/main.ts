import { PrismaRoomRepository } from "./prisma-repository.js";
import { MultiplayerServer } from "./server.js";

const pepper = process.env.RECONNECT_TOKEN_PEPPER;
const seedSecret = process.env.GAME_SEED_SECRET;
const origin = process.env.WEB_ORIGIN;
if (!pepper || pepper.length < 32 || !seedSecret || seedSecret.length < 32 || !origin) {
  throw new Error("RECONNECT_TOKEN_PEPPER, GAME_SEED_SECRET (32+ chars), and WEB_ORIGIN are required");
}
const server = new MultiplayerServer({
  repository: new PrismaRoomRepository(),
  reconnectTokenPepper: pepper,
  gameSeedSecret: seedSecret,
  allowedOrigins: [origin],
  logger: true,
});
await server.listen(Number(process.env.PORT ?? 3001), "0.0.0.0");

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void server.close().then(() => process.exit(0)));
}
