import { NextRequest, NextResponse } from "next/server";
import { extractArticle, ExtractionError } from "@/lib/extraction";

export async function POST(req: NextRequest) {
  const authed = req.cookies.get("ct_admin")?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url } = await req.json();
  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "A URL is required." }, { status: 400 });
  }

  try {
    const article = await extractArticle(url);
    return NextResponse.json(article);
  } catch (err) {
    const message =
      err instanceof ExtractionError
        ? err.message
        : "Could not extract this article. Try the manual fallback instead.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
