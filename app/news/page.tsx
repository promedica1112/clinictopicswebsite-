import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsFeed from "@/components/NewsFeed";
import { getPublishedCards, getSpecialties } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
  const cards = await getPublishedCards();
  const specialties = await getSpecialties();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl w-full px-5 py-12">
        <div className="text-center mb-10">
          <h1 className="font-heading font-bold text-3xl text-navy mb-2">
            Medical Updates in Brief
          </h1>
          <p className="text-slate max-w-xl mx-auto">
            Swipe through concise, evidence-based medical updates. Flip any card
            for the full clinical context.
          </p>
        </div>
        <NewsFeed cards={cards} specialties={specialties} />
      </main>
      <Footer />
    </div>
  );
}
