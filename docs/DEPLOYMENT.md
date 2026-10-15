# Production deployment

The approved production topology is Vercel for the Next.js client and Railway for the always-on Socket.IO server plus managed PostgreSQL.

## 1. Source repository

Push the complete monorepo to a private Git repository. Both hosting projects must use the same revision that passed `npm run check` and `npm run build:web`.

## 2. Railway

1. Create a Railway project from the repository.
2. Add a PostgreSQL service.
3. Add an application service from the repository root. Railway reads `railway.json` and builds `Dockerfile.server`.
4. Set `DATABASE_URL` using the PostgreSQL service reference.
5. Set `RECONNECT_TOKEN_PEPPER`, `GAME_SEED_SECRET`, `NODE_ENV=production`, and a temporary `WEB_ORIGIN` matching the eventual Vercel URL.
6. Generate a public HTTPS domain for the application service.
7. The pre-deploy command applies committed Prisma migrations. Deployment health is checked through `/readyz`; `/healthz` verifies the process alone.

## 3. Vercel

1. Import the same repository and keep the project root at the repository root.
2. Vercel reads `vercel.json`, installs the workspace, and builds `apps/web`.
3. Set `NEXT_PUBLIC_GAME_SERVER_URL` to the Railway HTTPS origin.
4. Set `NEXT_PUBLIC_WEB_URL` to the Vercel production origin.
5. Deploy production.

## 4. Close the origin loop

After the final Vercel domain is known, set Railway `WEB_ORIGIN` to that exact origin and redeploy the server. If the public web domain changes later, update both `WEB_ORIGIN` and `NEXT_PUBLIC_WEB_URL`.

## 5. Rollback

- Web: promote the previous healthy Vercel deployment.
- Server: redeploy the previous healthy Railway revision. Never roll back a schema migration until its data compatibility has been assessed.
- Database: use provider backups or point-in-time recovery for data incidents; do not delete production tables during rollback.
