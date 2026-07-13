import { NextRequest, NextResponse } from "next/server";
import { addVideo } from "@/lib/store";
import type { Video } from "@/lib/types";

export async function POST(req: NextRequest) {
  const authed = req.cookies.get("ct_admin")?.value === "1";
  if (!authed) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const video: Video = {
    id: `v${Date.now()}`,
    title: body.title,
    url: body.url,
    specialty: body.specialty,
    audience: body.audience,
    videoType: body.videoType,
    speakerName: body.speakerName,
    speakerCredentials: body.speakerCredentials,
    institution: body.institution || undefined,
    shortDescription: body.shortDescription,
    fullDescription: body.fullDescription || undefined,
    duration: body.duration || undefined,
    tags: body.tags
      ? body.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : [],
    reviewer: body.reviewer || undefined,
    publishedDate: body.publishedDate || new Date().toISOString().slice(0, 10),
    status: body.status === "draft" ? "draft" : "published",
    featured: !!body.featured,
  };

  addVideo(video);
  return NextResponse.json({ success: true, video });
}
