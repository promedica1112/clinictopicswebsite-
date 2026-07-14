"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Specialty, NewsCard } from "@/lib/types";
import NewsCardFlip from "@/components/NewsCardFlip";

const contentTypes = [
  "Clinical Update",
  "Clinical Research",
  "Drug and Regulatory Update",
  "Guidelines and Consensus",
  "Public Health",
  "Medical Technology",
  "Conference Highlight",
];

export default function CardForm({
  specialties,
  initial,
}: {
  specialties: Specialty[];
  initial?: Partial<
    NewsCard & {
      originalTitle: string;
      originalBody: string;
    }
  >;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    headline: initial?.headline ?? "",
    summary: initial?.summary ?? "",
    expanded: initial?.expanded ?? "",
    specialty: initial?.specialty ?? specialties[0]?.slug ?? "",
    audience: initial?.audience ?? "both",
    contentType: initial?.contentType ?? contentTypes[0],
    keyFindings: initial?.keyFindings?.join("\n") ?? "",
    clinicalRelevance: initial?.clinicalRelevance ?? "",
    limitation: initial?.limitation ?? "",
    sourceTitle: initial?.sourceTitle ?? "",
    sourceOrg: initial?.sourceOrg ?? "",
    sourceUrl: initial?.sourceUrl ?? "",
    imageUrl: initial?.imageUrl ?? "",
    publishedDate: initial?.publishedDate ?? new Date().toISOString().slice(0, 10),
    status: initial?.status ?? "published",
    featured: initial?.featured ?? false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      mood: initial?.mood,
      sourceDomain: initial?.sourceDomain,
      originalTitle: initial?.originalTitle,
      originalBody: initial?.originalBody,
      bodyDisplayMode: initial?.bodyDisplayMode,
      imageSource: initial?.imageSource,
      factCheckTitleStatus: initial?.factCheckTitleStatus,
      factCheckTitleSummary: initial?.factCheckTitleSummary,
      factCheckBodyStatus: initial?.factCheckBodyStatus,
      factCheckBodySummary: initial?.factCheckBodySummary,
      hasFactCheckWarning: initial?.hasFactCheckWarning,
      readingGrade: initial?.readingGrade,
    };
    const res = await fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal";
  const labelClass = "block text-xs font-semibold text-slate mb-1.5";

  const previewCard: NewsCard = {
    id: "preview",
    headline: form.headline || "Your headline will appear here",
    summary: form.summary || "Your front-of-card summary will appear here.",
    expanded: form.expanded || "Your expanded explanation will appear here.",
    specialty: form.specialty,
    audience: form.audience as NewsCard["audience"],
    contentType: form.contentType,
    keyFindings: form.keyFindings
      ? form.keyFindings.split("\n").map((f) => f.trim()).filter(Boolean)
      : ["Key findings will appear here"],
    clinicalRelevance: form.clinicalRelevance || "Clinical relevance will appear here.",
    limitation: form.limitation || "Limitations will appear here.",
    sourceTitle: form.sourceTitle || "Source title",
    sourceOrg: form.sourceOrg || "Source organization",
    sourceUrl: form.sourceUrl,
    imageUrl: form.imageUrl || undefined,
    publishedDate: form.publishedDate,
    status: "published",
  };

  const specialtyName =
    specialties.find((s) => s.slug === form.specialty)?.name ?? form.specialty;

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-10">
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className={labelClass}>Headline *</label>
          <input
            required
            className={inputClass}
            value={form.headline}
            onChange={(e) => update("headline", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Front Summary (50–90 words) *</label>
          <textarea
            required
            rows={3}
            className={inputClass}
            value={form.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Specialty *</label>
            <select
              required
              className={inputClass}
              value={form.specialty}
              onChange={(e) => update("specialty", e.target.value)}
            >
              {specialties.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Audience</label>
            <select
              className={inputClass}
              value={form.audience}
              onChange={(e) => update("audience", e.target.value)}
            >
              <option value="professional">Healthcare Professionals</option>
              <option value="patient">Patients and Public</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Content Type</label>
          <select
            className={inputClass}
            value={form.contentType}
            onChange={(e) => update("contentType", e.target.value)}
          >
            {contentTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>What happened? (expanded explanation) *</label>
          <textarea
            required
            rows={3}
            className={inputClass}
            value={form.expanded}
            onChange={(e) => update("expanded", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Key Findings (one per line)</label>
          <textarea
            rows={3}
            className={inputClass}
            value={form.keyFindings}
            onChange={(e) => update("keyFindings", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Clinical Relevance *</label>
          <textarea
            required
            rows={2}
            className={inputClass}
            value={form.clinicalRelevance}
            onChange={(e) => update("clinicalRelevance", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Important Limitation *</label>
          <textarea
            required
            rows={2}
            className={inputClass}
            value={form.limitation}
            onChange={(e) => update("limitation", e.target.value)}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Source Title *</label>
            <input
              required
              className={inputClass}
              value={form.sourceTitle}
              onChange={(e) => update("sourceTitle", e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Source Organization *</label>
            <input
              required
              className={inputClass}
              value={form.sourceOrg}
              onChange={(e) => update("sourceOrg", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Source URL</label>
          <input
            className={inputClass}
            value={form.sourceUrl}
            onChange={(e) => update("sourceUrl", e.target.value)}
          />
        </div>

        <div>
          <label className={labelClass}>Card Image URL (optional)</label>
          <input
            className={inputClass}
            placeholder="https://..."
            value={form.imageUrl}
            onChange={(e) => update("imageUrl", e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className={labelClass}>Status</label>
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-charcoal pt-5">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update("featured", e.target.checked)}
            />
            Feature on homepage
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-navy text-white font-semibold px-6 py-2.5 text-sm hover:bg-teal transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Publish Card"}
        </button>
      </form>

      <div>
        <p className={labelClass}>Live Preview</p>
        <NewsCardFlip card={previewCard} specialtyName={specialtyName} />
      </div>
    </div>
  );
}
