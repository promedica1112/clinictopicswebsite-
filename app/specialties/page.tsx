import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SpecialtyCard from "@/components/SpecialtyCard";
import { getSpecialties, getPublishedVideos, getPublishedCards } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SpecialtiesPage() {
  const specialties = await getSpecialties();
  const videos = await getPublishedVideos();
  const cards = await getPublishedCards();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-12">
        <h1 className="font-heading font-bold text-3xl text-navy mb-2">All Specialties</h1>
        <p className="text-slate mb-8">Browse videos and updates by medical specialty.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialties.map((s) => (
            <SpecialtyCard
              key={s.slug}
              specialty={s}
              videoCount={videos.filter((v) => v.specialty === s.slug).length}
              cardCount={cards.filter((c) => c.specialty === s.slug).length}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
