import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  USER_SESSION_COOKIE,
  verifySession,
} from "@/lib/auth";

export default async function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const ok =
    verifySession(store.get(USER_SESSION_COOKIE)?.value) ||
    verifySession(store.get(SESSION_COOKIE)?.value); // admin can view too
  if (!ok) redirect("/login");
  return <>{children}</>;
}
