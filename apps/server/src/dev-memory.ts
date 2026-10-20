import { MemoryRoomRepository } from "./repository.js";
import { MultiplayerServer } from "./server.js";

const server = new MultiplayerServer({
  repository: new MemoryRoomRepository(),
  reconnectTokenPepper: "local-development-pepper-change-me-123456",
  gameSeedSecret: "local-development-seed-secret-change-123",
  allowedOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3100", "http://127.0.0.1:3100"],
  logger: true,
});

await server.listen(Number(process.env.PORT ?? 3001), "127.0.0.1");
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => void server.close().then(() => process.exit(0)));
}
