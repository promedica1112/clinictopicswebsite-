import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import type { Specialty } from "@/lib/types";

export default function SpecialtyCard({
  specialty,
  videoCount,
  cardCount,
}: {
  specialty: Specialty;
  videoCount: number;
  cardCount: number;
}) {
  return (
    <Link
      href={`/specialties/${specialty.slug}`}
      className="group flex items-center justify-between rounded-xl border border-border bg-white p-4 hover:border-teal hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="h-9 w-9 rounded-lg bg-aqua flex items-center justify-center text-teal">
          <Activity size={16} />
        </span>
        <div>
          <p className="font-heading font-semibold text-sm text-charcoal">{specialty.name}</p>
          <p className="text-xs text-slate">
            {videoCount} videos &middot; {cardCount} updates
          </p>
        </div>
      </div>
      <ArrowRight
        size={16}
        className="text-slate group-hover:text-teal group-hover:translate-x-0.5 transition-all"
      />
    </Link>
  );
}
