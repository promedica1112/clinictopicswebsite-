import Link from "next/link";
import { Play } from "lucide-react";
import type { Video } from "@/lib/types";
import { getThumbnailUrl, formatDate, audienceLabel } from "@/lib/utils";

export default function VideoCard({
  video,
  specialtyName,
}: {
  video: Video;
  specialtyName?: string;
}) {
  const thumb = getThumbnailUrl(video.url);
  const badgeColor =
    video.audience === "professional"
      ? "bg-badge-pro"
      : video.audience === "patient"
      ? "bg-badge-patient"
      : "bg-teal";

  return (
    <Link
      href={`/videos/watch/${video.id}`}
      className="group block rounded-2xl border border-border bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video bg-offwhite overflow-hidden">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumb}
            alt={video.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate">
            No preview
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-navy/0 group-hover:bg-navy/20 transition-colors">
          <span className="h-11 w-11 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play size={18} className="text-navy ml-0.5" fill="currentColor" />
          </span>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/75 text-white text-xs px-1.5 py-0.5">
            {video.duration}
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2 text-xs font-medium">
          {specialtyName && (
            <span className="text-teal uppercase tracking-wide">{specialtyName}</span>
          )}
          <span className={`text-white ${badgeColor} rounded-full px-2 py-0.5`}>
            {audienceLabel(video.audience)}
          </span>
        </div>
        <h3 className="font-heading font-semibold text-charcoal leading-snug mb-1 line-clamp-2">
          {video.title}
        </h3>
        <p className="text-sm text-slate mb-2">
          {video.speakerName}
          {video.speakerCredentials ? `, ${video.speakerCredentials}` : ""}
        </p>
        <p className="text-xs text-slate">{formatDate(video.publishedDate)}</p>
      </div>
    </Link>
  );
}
