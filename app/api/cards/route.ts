import { NextRequest, NextResponse } from "next/server";
import { addCard } from "@/lib/db";
import type { NewsCard } from "@/lib/types";

export async function POST(req: NextRequest) {
  const authed = req.cookies.get("ct_admin")?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const card: NewsCard = {
    id: `c${Date.now()}`,
    headline: body.headline,
    summary: body.summary,
    expanded: body.expanded,
    specialty: body.specialty,
    audience: body.audience,
    contentType: body.contentType,
    keyFindings: body.keyFindings
      ? body.keyFindings.split("\n").map((f: string) => f.trim()).filter(Boolean)
      : [],
    clinicalRelevance: body.clinicalRelevance,
    limitation: body.limitation,
    sourceTitle: body.sourceTitle,
    sourceOrg: body.sourceOrg,
    sourceUrl: body.sourceUrl || undefined,
    publishedDate: body.publishedDate || new Date().toISOString().slice(0, 10),
    relatedVideoId: body.relatedVideoId || undefined,
    status: body.status === "draft" ? "draft" : "published",
    featured: !!body.featured,
    mood: body.mood || undefined,
    sourceDomain: body.sourceDomain || undefined,
    originalTitle: body.originalTitle || undefined,
    originalBody: body.originalBody || undefined,
    bodyDisplayMode: body.bodyDisplayMode || undefined,
    imageUrl: body.imageUrl || undefined,
    imageSource: body.imageSource || undefined,
    factCheckTitleStatus: body.factCheckTitleStatus || undefined,
    factCheckTitleSummary: body.factCheckTitleSummary || undefined,
    factCheckBodyStatus: body.factCheckBodyStatus || undefined,
    factCheckBodySummary: body.factCheckBodySummary || undefined,
    hasFactCheckWarning: !!body.hasFactCheckWarning,
    readingGrade: body.readingGrade || undefined,
  };

  await addCard(card);
  return NextResponse.json({ success: true, card });
}
