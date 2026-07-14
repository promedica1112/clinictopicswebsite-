import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import NewsCardFlip from "@/components/NewsCardFlip";
import { getSpecialties, getPublishedVideos, getPublishedCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SpecialtyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const specialties = await getSpecialties();
  const specialty = specialties.find((s) => s.slug === slug);
  if (!specialty) notFound();

  const videos = (await getPublishedVideos()).filter((v) => v.specialty === slug);
  const cards = (await getPublishedCards()).filter((c) => c.specialty === slug);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-12">
        <h1 className="font-heading font-bold text-3xl text-navy mb-8">{specialty.name}</h1>

        <h2 className="font-heading font-semibold text-xl text-navy mb-4">Videos</h2>
        {videos.length === 0 ? (
          <p className="text-slate mb-10">No videos published in this specialty yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {videos.map((v) => (
              <VideoCard key={v.id} video={v} specialtyName={specialty.name} />
            ))}
          </div>
        )}

        <h2 className="font-heading font-semibold text-xl text-navy mb-4">Medical Updates</h2>
        {cards.length === 0 ? (
          <p className="text-slate">No updates published in this specialty yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((c) => (
              <NewsCardFlip key={c.id} card={c} specialtyName={specialty.name} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
