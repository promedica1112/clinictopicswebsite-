import Link from "next/link";
import { PlusCircle, Video, Newspaper } from "lucide-react";
import { getVideos, getCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const videos = await getVideos();
  const cards = await getCards();

  const stats = [
    { label: "Published Videos", value: videos.filter((v) => v.status === "published").length },
    { label: "Draft Videos", value: videos.filter((v) => v.status === "draft").length },
    { label: "Published Updates", value: cards.filter((c) => c.status === "published").length },
    { label: "Draft Updates", value: cards.filter((c) => c.status === "draft").length },
  ];

  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-5 py-6 flex items-center justify-between">
          <h1 className="font-heading font-bold text-xl">Clinic Topics — Admin</h1>
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            View site →
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-white p-5">
              <p className="text-3xl font-heading font-bold text-navy">{s.value}</p>
              <p className="text-xs text-slate mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6 mb-12">
          <Link
            href="/admin/videos/new"
            className="rounded-2xl border border-border bg-white p-6 hover:border-teal hover:shadow-sm transition-all flex items-start gap-4"
          >
            <span className="h-11 w-11 rounded-xl bg-teal/10 text-teal flex items-center justify-center shrink-0">
              <Video size={20} />
            </span>
            <div>
              <h2 className="font-heading font-semibold text-navy mb-1 flex items-center gap-1.5">
                Add New Video <PlusCircle size={14} />
              </h2>
              <p className="text-sm text-slate">
                Paste a YouTube or Vimeo link and publish it to a specialty.
              </p>
            </div>
          </Link>

          <Link
            href="/admin/cards/new"
            className="rounded-2xl border border-border bg-white p-6 hover:border-teal hover:shadow-sm transition-all flex items-start gap-4"
          >
            <span className="h-11 w-11 rounded-xl bg-blue/10 text-blue flex items-center justify-center shrink-0">
              <Newspaper size={20} />
            </span>
            <div>
              <h2 className="font-heading font-semibold text-navy mb-1 flex items-center gap-1.5">
                Create News Card <PlusCircle size={14} />
              </h2>
              <p className="text-sm text-slate">
                Write a swipeable medical update with front summary and detailed back.
              </p>
            </div>
          </Link>
        </div>

        <h2 className="font-heading font-semibold text-navy mb-4">Recent Videos</h2>
        <div className="rounded-xl border border-border bg-white overflow-hidden mb-10">
          {videos.slice(0, 6).map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 text-sm"
            >
              <span className="font-medium text-charcoal">{v.title}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  v.status === "published"
                    ? "bg-success/10 text-success"
                    : "bg-caution/10 text-caution"
                }`}
              >
                {v.status}
              </span>
            </div>
          ))}
        </div>

        <h2 className="font-heading font-semibold text-navy mb-4">Recent Updates</h2>
        <div className="rounded-xl border border-border bg-white overflow-hidden">
          {cards.slice(0, 6).map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between px-4 py-3 border-b border-border last:border-b-0 text-sm"
            >
              <span className="font-medium text-charcoal">{c.headline}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  c.status === "published"
                    ? "bg-success/10 text-success"
                    : "bg-caution/10 text-caution"
                }`}
              >
                {c.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
