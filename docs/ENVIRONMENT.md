# Environment variables

## Multiplayer server

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `DATABASE_URL` | Yes | Yes | PostgreSQL connection string. Railway may supply this through a database reference. |
| `WEB_ORIGIN` | Yes | No | Exact HTTPS origin of the deployed web client, with no trailing slash. Used for the Socket.IO CORS allowlist. |
| `RECONNECT_TOKEN_PEPPER` | Yes | Yes | At least 32 random characters used to hash reconnect credentials. Generate independently for production. |
| `GAME_SEED_SECRET` | Yes | Yes | At least 32 random characters used for unpredictable server-side match seeds. Generate independently for production. |
| `PORT` | Provider | No | Listening port. Railway injects this automatically. |
| `NODE_ENV` | Yes | No | Set to `production`. |

Generate secrets with a cryptographically secure generator, for example `openssl rand -hex 32`. Never commit generated values.

## Web client

| Variable | Required | Secret | Purpose |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_GAME_SERVER_URL` | Yes | No | Public HTTPS origin of the Railway multiplayer service. The browser converts it to WSS for Socket.IO. |
| `NEXT_PUBLIC_WEB_URL` | Yes | No | Public HTTPS origin of the Vercel site, used for absolute social metadata. |

Both web variables are build-time public values. Redeploy the web project after changing them.
