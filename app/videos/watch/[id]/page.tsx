import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { getPublishedVideos, getSpecialties } from "@/lib/db";
import { getEmbedUrl, formatDate, audienceLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const videos = await getPublishedVideos();
  const video = videos.find((v) => v.id === id);
  const specialties = await getSpecialties();

  if (!video) notFound();

  const specialtyName =
    specialties.find((s) => s.slug === video.specialty)?.name ?? video.specialty;

  const related = videos
    .filter((v) => v.specialty === video.specialty && v.id !== video.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl w-full px-5 py-10">
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black mb-6">
          <iframe
            src={getEmbedUrl(video.url)}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-3">
          <span className="text-teal uppercase tracking-wide">{specialtyName}</span>
          <span className="text-border">·</span>
          <span className="text-slate">{video.videoType}</span>
          <span className="text-border">·</span>
          <span className="text-slate">{audienceLabel(video.audience)}</span>
        </div>

        <h1 className="font-heading font-bold text-2xl md:text-3xl text-navy mb-2">
          {video.title}
        </h1>
        <p className="text-sm text-slate mb-6">
          {video.speakerName}
          {video.speakerCredentials ? `, ${video.speakerCredentials}` : ""}
          {video.institution ? ` — ${video.institution}` : ""}
          {" · "}
          {formatDate(video.publishedDate)}
          {video.duration ? ` · ${video.duration}` : ""}
        </p>

        <p className="text-base text-charcoal leading-relaxed mb-8 max-w-3xl">
          {video.fullDescription ?? video.shortDescription}
        </p>

        {video.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {video.tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-offwhite border border-border rounded-full px-3 py-1 text-slate"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-offwhite border border-border p-4 text-xs text-slate mb-12">
          Clinic Topics provides medical education and general health information.
          This content is not a substitute for individual clinical assessment,
          diagnosis, or treatment.
          {video.reviewer && <> Medically reviewed by {video.reviewer}.</>}
        </div>

        {related.length > 0 && (
          <>
            <h2 className="font-heading font-bold text-xl text-navy mb-5">Related Videos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((v) => (
                <VideoCard key={v.id} video={v} specialtyName={specialtyName} />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
