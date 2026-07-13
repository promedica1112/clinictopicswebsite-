import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import VideoForm from "@/components/admin/VideoForm";
import { getSpecialties } from "@/lib/store";

export default function NewVideoPage() {
  const specialties = getSpecialties();
  return (
    <div className="min-h-screen bg-offwhite">
      <div className="bg-navy text-white">
        <div className="mx-auto max-w-6xl px-5 py-6">
          <Link href="/admin" className="text-sm text-white/70 hover:text-white inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back to dashboard
          </Link>
          <h1 className="font-heading font-bold text-xl mt-2">Add New Video</h1>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-10">
        <VideoForm specialties={specialties} />
      </div>
    </div>
  );
}
