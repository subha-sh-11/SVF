import { Pool } from "pg";

// Reuse a single pool across hot reloads in dev.
const globalForPg = globalThis as unknown as { pgPool?: Pool };

// Strip `sslmode` from the URL — we set ssl ourselves below, and leaving the
// param in makes pg-connection-string emit a noisy Node "SECURITY WARNING"
// (which Next surfaces as a blocking dev error overlay).
function cleanConnString(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/([?&])sslmode=[^&]*(&|$)/i, (_m, p1, p2) =>
    p2 === "&" ? p1 : ""
  );
}

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: cleanConnString(process.env.DATABASE_URL),
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") globalForPg.pgPool = pool;
