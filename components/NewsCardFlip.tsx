"use client";

import { useState } from "react";
import Link from "next/link";
import { RotateCw, ExternalLink, Bookmark } from "lucide-react";
import type { NewsCard } from "@/lib/types";
import { formatDate, audienceLabel } from "@/lib/utils";

export default function NewsCardFlip({
  card,
  specialtyName,
}: {
  card: NewsCard;
  specialtyName?: string;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className={`flip-card ${flipped ? "flipped" : ""} h-[480px] w-full`}>
      <div className="flip-card-inner h-full w-full">
        {/* FRONT */}
        <div className="flip-card-face h-full w-full rounded-2xl border border-border bg-white shadow-sm flex flex-col p-6">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-teal mb-3">
            <span>{specialtyName ?? card.specialty}</span>
            <span className="text-border">·</span>
            <span className="text-slate">{card.contentType}</span>
          </div>
          <p className="text-xs text-slate mb-4">
            {audienceLabel(card.audience)} &middot; {formatDate(card.publishedDate)}
          </p>

          <h3 className="font-heading font-bold text-xl text-navy leading-snug mb-3">
            {card.headline}
          </h3>

          <p className="text-sm text-charcoal leading-relaxed flex-1 overflow-hidden">
            {card.summary}
          </p>

          <div className="mt-4 rounded-lg bg-aqua px-3 py-2 text-xs text-navy font-medium">
            {card.sourceOrg}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              aria-label="Save"
              className="h-9 w-9 flex items-center justify-center rounded-full text-slate hover:bg-offwhite"
            >
              <Bookmark size={16} />
            </button>
            <button
              onClick={() => setFlipped(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-navy text-white text-sm font-semibold px-4 py-2 hover:bg-teal transition-colors"
            >
              <RotateCw size={14} />
              Flip for details
            </button>
          </div>
        </div>

        {/* BACK */}
        <div className="flip-card-face flip-card-back h-full w-full rounded-2xl border border-border bg-offwhite shadow-sm flex flex-col p-6 overflow-y-auto">
          <h4 className="font-heading font-semibold text-navy mb-2">What happened?</h4>
          <p className="text-sm text-charcoal leading-relaxed mb-4">{card.expanded}</p>

          <h4 className="font-heading font-semibold text-navy mb-2">Key findings</h4>
          <ul className="text-sm text-charcoal space-y-1 mb-4 list-disc list-inside">
            {card.keyFindings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>

          <h4 className="font-heading font-semibold text-navy mb-2">Clinical relevance</h4>
          <p className="text-sm text-charcoal leading-relaxed mb-4">{card.clinicalRelevance}</p>

          <div className="rounded-lg border border-caution/30 bg-caution/10 px-3 py-2 text-xs text-charcoal mb-4">
            <span className="font-semibold text-caution">Limitation: </span>
            {card.limitation}
          </div>

          <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
            <span className="text-xs text-slate">
              {card.sourceTitle}, {card.sourceOrg}
            </span>
            <div className="flex items-center gap-2">
              {card.sourceUrl && (
                <a
                  href={card.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full text-slate hover:bg-white"
                  aria-label="Open source"
                >
                  <ExternalLink size={14} />
                </a>
              )}
              <button
                onClick={() => setFlipped(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-border text-navy text-sm font-semibold px-4 py-2 hover:bg-aqua transition-colors"
              >
                Back to summary
              </button>
            </div>
          </div>
          {card.relatedVideoId && (
            <Link
              href={`/videos/watch/${card.relatedVideoId}`}
              className="mt-3 text-xs font-semibold text-blue hover:underline"
            >
              Watch the related video →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
