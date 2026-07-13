import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { getSpecialties, getPublishedVideos } from "@/lib/store";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ specialty?: string; audience?: string }>;
}) {
  const params = await searchParams;
  const specialties = getSpecialties();
  let videos = getPublishedVideos();

  if (params.specialty) {
    videos = videos.filter((v) => v.specialty === params.specialty);
  }
  if (params.audience) {
    videos = videos.filter(
      (v) => v.audience === params.audience || v.audience === "both"
    );
  }

  const specialtyName = (slug: string) =>
    specialties.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-12">
        <h1 className="font-heading font-bold text-3xl text-navy mb-2">
          Medical Video Library
        </h1>
        <p className="text-slate mb-8 max-w-2xl">
          Explore expert-led clinical education and reliable patient-focused
          health information across medical specialties.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/videos"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              !params.audience
                ? "bg-navy text-white border-navy"
                : "border-border text-slate hover:border-teal"
            }`}
          >
            All
          </a>
          <a
            href="/videos?audience=professional"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              params.audience === "professional"
                ? "bg-badge-pro text-white border-badge-pro"
                : "border-border text-slate hover:border-teal"
            }`}
          >
            For Doctors
          </a>
          <a
            href="/videos?audience=patient"
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
              params.audience === "patient"
                ? "bg-badge-patient text-white border-badge-patient"
                : "border-border text-slate hover:border-teal"
            }`}
          >
            For Patients
          </a>
        </div>

        <div className="grid md:grid-cols-[220px_1fr] gap-8">
          <aside className="hidden md:block">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate mb-3">
              Specialty
            </p>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="/videos"
                  className={`block px-2 py-1.5 rounded-lg ${
                    !params.specialty ? "bg-aqua text-navy font-semibold" : "text-slate hover:bg-offwhite"
                  }`}
                >
                  All Specialties
                </a>
              </li>
              {specialties.map((s) => (
                <li key={s.slug}>
                  <a
                    href={`/videos?specialty=${s.slug}`}
                    className={`block px-2 py-1.5 rounded-lg ${
                      params.specialty === s.slug
                        ? "bg-aqua text-navy font-semibold"
                        : "text-slate hover:bg-offwhite"
                    }`}
                  >
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          <div>
            {videos.length === 0 ? (
              <p className="text-slate">No videos match this filter yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((v) => (
                  <VideoCard key={v.id} video={v} specialtyName={specialtyName(v.specialty)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
