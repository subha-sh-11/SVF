import { NextResponse } from "next/server";
import { currentRep, publicRep } from "@/lib/rep-data";

export async function GET() {
  const rep = await currentRep();
  if (!rep) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  return NextResponse.json({ representative: publicRep(rep) });
}
