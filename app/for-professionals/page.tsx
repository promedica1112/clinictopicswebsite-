import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import { getPublishedVideos, getSpecialties } from "@/lib/store";

export default function ForProfessionalsPage() {
  const specialties = getSpecialties();
  const videos = getPublishedVideos().filter(
    (v) => v.audience === "professional" || v.audience === "both"
  );
  const specialtyName = (slug: string) =>
    specialties.find((s) => s.slug === slug)?.name ?? slug;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-12">
        <h1 className="font-heading font-bold text-3xl text-navy mb-2">
          For Healthcare Professionals
        </h1>
        <p className="text-slate mb-8 max-w-2xl">
          Peer education, clinical updates, expert commentary, guidelines and
          evidence, and congress highlights.
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} specialtyName={specialtyName(v.specialty)} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
