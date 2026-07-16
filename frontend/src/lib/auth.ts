import crypto from "crypto";

// Defaults let a teammate log in from a fresh clone without any .env.
// Override via environment variables in production.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@svf.in";
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@321";
const SECRET = process.env.AUTH_SECRET || "svf-dev-secret-change-me";

export const SESSION_COOKIE = "svf_session";
const MAX_AGE_SEC = 7 * 24 * 60 * 60; // 7 days

export function checkCredentials(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

export function signSession(email: string): string {
  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const payload = `${email}|${exp}`;
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifySession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const payload = Buffer.from(body, "base64url").toString();
  const expected = crypto
    .createHmac("sha256", SECRET)
    .update(payload)
    .digest("base64url");
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return false;
  }
  const exp = Number(payload.split("|")[1]);
  return Number.isFinite(exp) && exp > Date.now();
}

export const SESSION_MAX_AGE = MAX_AGE_SEC;
