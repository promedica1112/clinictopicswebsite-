"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Specialty } from "@/lib/types";

const videoTypes = [
  "Expert Interview",
  "Clinical Lecture",
  "Case Discussion",
  "Procedure Demonstration",
  "Guideline Update",
  "Patient Education",
  "Prevention Tip",
  "Conference Highlight",
];

export default function VideoForm({ specialties }: { specialties: Specialty[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    url: "",
    specialty: specialties[0]?.slug ?? "",
    audience: "professional",
    videoType: videoTypes[0],
    speakerName: "",
    speakerCredentials: "",
    institution: "",
    shortDescription: "",
    fullDescription: "",
    duration: "",
    tags: "",
    reviewer: "",
    publishedDate: new Date().toISOString().slice(0, 10),
    status: "published",
    featured: false,
  });

  const update = (key: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/videos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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

  return (
    <form onSubmit={submit} className="space-y-5 max-w-2xl">
      <div>
        <label className={labelClass}>Video Title *</label>
        <input
          required
          className={inputClass}
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>YouTube or Vimeo URL *</label>
        <input
          required
          className={inputClass}
          placeholder="https://www.youtube.com/watch?v=..."
          value={form.url}
          onChange={(e) => update("url", e.target.value)}
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
          <label className={labelClass}>Audience *</label>
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

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Video Type</label>
          <select
            className={inputClass}
            value={form.videoType}
            onChange={(e) => update("videoType", e.target.value)}
          >
            {videoTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input
            className={inputClass}
            placeholder="12:30"
            value={form.duration}
            onChange={(e) => update("duration", e.target.value)}
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Speaker Name *</label>
          <input
            required
            className={inputClass}
            value={form.speakerName}
            onChange={(e) => update("speakerName", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Speaker Credentials</label>
          <input
            className={inputClass}
            placeholder="MD, DM Cardiology"
            value={form.speakerCredentials}
            onChange={(e) => update("speakerCredentials", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Institution</label>
        <input
          className={inputClass}
          value={form.institution}
          onChange={(e) => update("institution", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Short Description *</label>
        <textarea
          required
          rows={2}
          className={inputClass}
          value={form.shortDescription}
          onChange={(e) => update("shortDescription", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Full Description</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.fullDescription}
          onChange={(e) => update("fullDescription", e.target.value)}
        />
      </div>

      <div>
        <label className={labelClass}>Tags (comma-separated)</label>
        <input
          className={inputClass}
          placeholder="diabetes, prevention"
          value={form.tags}
          onChange={(e) => update("tags", e.target.value)}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Medical Reviewer</label>
          <input
            className={inputClass}
            value={form.reviewer}
            onChange={(e) => update("reviewer", e.target.value)}
          />
        </div>
        <div>
          <label className={labelClass}>Publication Date</label>
          <input
            type="date"
            className={inputClass}
            value={form.publishedDate}
            onChange={(e) => update("publishedDate", e.target.value)}
          />
        </div>
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
        {saving ? "Saving…" : "Publish Video"}
      </button>
    </form>
  );
}
