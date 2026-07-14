import { NextRequest, NextResponse } from "next/server";
import { rephraseTitleAndBody } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const authed = req.cookies.get("ct_admin")?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, body, mood } = await req.json();
  if (!title || !body || !mood) {
    return NextResponse.json(
      { error: "Title, body, and mood are all required." },
      { status: 400 }
    );
  }

  try {
    const result = await rephraseTitleAndBody(title, body, mood);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Rephrasing failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
