"use client";

import { useRef, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { NewsCard, Specialty } from "@/lib/types";
import NewsCardFlip from "./NewsCardFlip";

export default function NewsFeed({
  cards,
  specialties,
}: {
  cards: NewsCard[];
  specialties: Specialty[];
}) {
  const [index, setIndex] = useState(0);
  const touchStartY = useRef<number | null>(null);

  const specialtyName = (slug: string) =>
    specialties.find((s) => s.slug === slug)?.name ?? slug;

  const next = () => setIndex((i) => Math.min(i + 1, cards.length - 1));
  const prev = () => setIndex((i) => Math.max(i - 1, 0));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (Math.abs(delta) > 50) {
      if (delta > 0) next();
      else prev();
    }
    touchStartY.current = null;
  };

  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-offwhite p-10 text-center text-slate">
        No medical updates published yet. Check back soon.
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full max-w-sm"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <NewsCardFlip card={card} specialtyName={specialtyName(card.specialty)} />
      </div>

      <div className="flex items-center gap-4 mt-5">
        <button
          onClick={prev}
          disabled={index === 0}
          aria-label="Previous update"
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border text-navy disabled:opacity-30 hover:bg-offwhite transition-colors"
        >
          <ChevronUp size={18} />
        </button>
        <span className="text-sm text-slate font-medium tabular-nums">
          {index + 1} of {cards.length}
        </span>
        <button
          onClick={next}
          disabled={index === cards.length - 1}
          aria-label="Next update"
          className="h-10 w-10 flex items-center justify-center rounded-full border border-border text-navy disabled:opacity-30 hover:bg-offwhite transition-colors"
        >
          <ChevronDown size={18} />
        </button>
      </div>
      <p className="text-xs text-slate mt-2 sm:hidden">Swipe up or down for more updates</p>
    </div>
  );
}
