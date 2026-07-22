import crypto from "crypto";

// Same signing scheme as the rep app's server/auth.js.
const SECRET = process.env.AUTH_SECRET || "svf-dev-secret-change-me";

export const REP_SESSION_COOKIE = "rep_session";
export const REP_SESSION_MAX_AGE = 7 * 24 * 60 * 60; // seconds

export function signRepSession(repId: string): string {
  const exp = Date.now() + REP_SESSION_MAX_AGE * 1000;
  const payload = `${repId}|${exp}`;
  const sig = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyRepSession(token: string | undefined | null): string | null {
  if (!token) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const payload = Buffer.from(body, "base64url").toString();
  const expected = crypto.createHmac("sha256", SECRET).update(payload).digest("base64url");
  if (
    expected.length !== sig.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
  ) {
    return null;
  }
  const [repId, expStr] = payload.split("|");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) return null;
  return repId;
}

// scrypt password verification (matches how the rep app stored password_hash).
export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored || !stored.includes(":")) return false;
  const [s, h] = stored.split(":");
  const hh = crypto.scryptSync(String(password), s, 64).toString("hex");
  const a = Buffer.from(h, "hex");
  const b = Buffer.from(hh, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Hash a password as "saltHex:hashHex" (same scheme verifyPassword expects).
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
