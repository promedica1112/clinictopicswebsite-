import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AIIntakeFlow from "@/components/admin/AIIntakeFlow";
import { getSpecialties } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewCardFromUrlPage() {
  const specialties = await getSpecialties();
  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="font-heading font-bold text-xl mt-2">Create News Card from Article URL</h1>
          <p className="text-sm text-white/70 mt-1">
            Extract, rephrase, fact-check, and publish — assisted by AI, reviewed by you.
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <AIIntakeFlow specialties={specialties} />
      </div>
    </div>
  );
}
