import Link from "next/link";
import { Search, Stethoscope } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-7xl px-5 h-16 flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-white">
            <Stethoscope size={18} />
          </span>
          <span className="font-heading font-bold text-lg text-navy tracking-tight">
            Clinic Topics
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-charcoal">
          <Link href="/videos" className="hover:text-teal transition-colors">
            Videos
          </Link>
          <Link href="/news" className="hover:text-teal transition-colors">
            Medical Updates
          </Link>
          <Link href="/specialties" className="hover:text-teal transition-colors">
            Specialties
          </Link>
          <Link href="/for-professionals" className="hover:text-teal transition-colors">
            For Doctors
          </Link>
          <Link href="/for-patients" className="hover:text-teal transition-colors">
            For Patients
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <button
            aria-label="Search"
            className="h-9 w-9 flex items-center justify-center rounded-full text-slate hover:bg-offwhite transition-colors"
          >
            <Search size={18} />
          </button>
          <Link
            href="/news"
            className="hidden sm:inline-flex items-center rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white hover:bg-navy transition-colors"
          >
            Explore Updates
          </Link>
        </div>
      </div>
    </header>
  );
}
