import Link from "next/link";
import { Stethoscope, Users, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import VideoCard from "@/components/VideoCard";
import SpecialtyCard from "@/components/SpecialtyCard";
import NewsCardFlip from "@/components/NewsCardFlip";
import {
  getSpecialties,
  getPublishedVideos,
  getPublishedCards,
} from "@/lib/store";

export default function Home() {
  const specialties = getSpecialties();
  const videos = getPublishedVideos();
  const cards = getPublishedCards();

  const specialtyName = (slug: string) =>
    specialties.find((s) => s.slug === slug)?.name ?? slug;

  const featuredCards = cards.filter((c) => c.featured).slice(0, 3);
  const latestVideos = [...videos]
    .sort((a, b) => (a.publishedDate < b.publishedDate ? 1 : -1))
    .slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <section className="bg-offwhite border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="font-heading font-extrabold text-4xl md:text-5xl text-navy leading-tight mb-5">
              Trusted Medical Knowledge.
              <br />
              Clearly Delivered.
            </h1>
            <p className="text-base md:text-lg text-slate leading-relaxed mb-8 max-w-md">
              Expert-led videos, concise medical updates, clinical insights, and
              health education across every specialty.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/videos"
                className="inline-flex items-center gap-2 rounded-full bg-teal text-white font-semibold px-6 py-3 hover:bg-navy transition-colors"
              >
                Watch Medical Videos
              </Link>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-border text-navy font-semibold px-6 py-3 hover:bg-aqua transition-colors"
              >
                Explore Latest Updates
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            {featuredCards[0] && (
              <NewsCardFlip
                card={featuredCards[0]}
                specialtyName={specialtyName(featuredCards[0].specialty)}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-white p-8">
          <span className="h-11 w-11 rounded-xl bg-badge-pro/10 text-badge-pro flex items-center justify-center mb-4">
            <Stethoscope size={20} />
          </span>
          <h2 className="font-heading font-bold text-xl text-navy mb-2">
            For Healthcare Professionals
          </h2>
          <p className="text-sm text-slate leading-relaxed mb-5">
            Peer education, clinical updates, expert commentary, guidelines and
            evidence, congress highlights.
          </p>
          <Link
            href="/for-professionals"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-badge-pro hover:underline"
          >
            Explore Professional Education <ArrowRight size={14} />
          </Link>
        </div>
        <div className="rounded-2xl border border-border bg-white p-8">
          <span className="h-11 w-11 rounded-xl bg-badge-patient/10 text-badge-patient flex items-center justify-center mb-4">
            <Users size={20} />
          </span>
          <h2 className="font-heading font-bold text-xl text-navy mb-2">
            For Patients and the Public
          </h2>
          <p className="text-sm text-slate leading-relaxed mb-5">
            Health awareness, prevention guidance, treatment explanations,
            specialist-led education.
          </p>
          <Link
            href="/for-patients"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-badge-patient hover:underline"
          >
            Explore Patient Education <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <section className="bg-aqua/40 border-y border-border">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl text-navy">
              Medical Updates in Brief
            </h2>
            <Link href="/news" className="text-sm font-semibold text-teal hover:underline">
              View All Updates →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCards.map((card) => (
              <NewsCardFlip
                key={card.id}
                card={card}
                specialtyName={specialtyName(card.specialty)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-heading font-bold text-2xl text-navy">Explore by Specialty</h2>
          <Link href="/specialties" className="text-sm font-semibold text-teal hover:underline">
            View All Specialties →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {specialties.slice(0, 8).map((s) => (
            <SpecialtyCard
              key={s.slug}
              specialty={s}
              videoCount={videos.filter((v) => v.specialty === s.slug).length}
              cardCount={cards.filter((c) => c.specialty === s.slug).length}
            />
          ))}
        </div>
      </section>

      <section className="bg-offwhite border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-heading font-bold text-2xl text-navy">Latest Videos</h2>
            <Link href="/videos" className="text-sm font-semibold text-teal hover:underline">
              View All Videos →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestVideos.map((v) => (
              <VideoCard key={v.id} video={v} specialtyName={specialtyName(v.specialty)} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
