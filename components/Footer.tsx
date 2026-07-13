import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      <div className="mx-auto max-w-7xl px-5 py-14 grid gap-10 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <div className="font-heading font-bold text-lg mb-3">Clinic Topics</div>
          <p className="text-sm text-white/70 leading-relaxed">
            Medical knowledge in focus — expert-led video education and concise
            clinical updates for healthcare professionals and the public.
          </p>
        </div>
        <div>
          <div className="font-heading font-semibold mb-3 text-sm uppercase tracking-wide text-white/60">
            Explore
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/videos" className="hover:text-white">Videos</Link></li>
            <li><Link href="/news" className="hover:text-white">Medical Updates</Link></li>
            <li><Link href="/specialties" className="hover:text-white">Specialties</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-heading font-semibold mb-3 text-sm uppercase tracking-wide text-white/60">
            Policies
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/editorial-policy" className="hover:text-white">Editorial Policy</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms of Use</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-heading font-semibold mb-3 text-sm uppercase tracking-wide text-white/60">
            Contact
          </div>
          <ul className="space-y-2 text-sm text-white/80">
            <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
            <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-white/60 leading-relaxed">
          Clinic Topics provides medical education and general health information.
          Content is not a substitute for individual clinical assessment, diagnosis,
          or treatment. Healthcare professionals should exercise independent
          clinical judgment.
        </p>
      </div>
    </footer>
  );
}
