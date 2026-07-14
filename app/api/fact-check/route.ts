import { NextRequest, NextResponse } from "next/server";
import { factCheckRephrase } from "@/lib/openai";

export async function POST(req: NextRequest) {
  const authed = req.cookies.get("ct_admin")?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { originalTitle, rephrasedTitle, originalBody, rephrasedBody } = await req.json();
  if (!originalTitle || !rephrasedTitle || !originalBody || !rephrasedBody) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  const result = await factCheckRephrase(
    originalTitle,
    rephrasedTitle,
    originalBody,
    rephrasedBody
  );
  return NextResponse.json(result);
}
