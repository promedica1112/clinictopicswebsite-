"use client";

import { useState } from "react";
import type { Specialty, NewsCard, Audience, FactCheckStatus } from "@/lib/types";
import CardForm from "./CardForm";

const MOODS = [
  "Neutral",
  "Professional",
  "Promotional",
  "Simplified Patient-Friendly",
  "Academic/Physician-Facing",
  "Conversational",
  "Creative",
  "Serious",
  "Empathetic",
];

type FactCheck = {
  title: { status: "ok" | "warn"; summary: string };
  body: { status: "ok" | "warn"; summary: string };
  hasWarning: boolean;
};

export default function AIIntakeFlow({ specialties }: { specialties: Specialty[] }) {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);

  // Stage 1
  const [sourceUrl, setSourceUrl] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualBody, setManualBody] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalBody, setOriginalBody] = useState("");
  const [sourceDomain, setSourceDomain] = useState("");
  const [images, setImages] = useState<string[]>([]);

  // Stage 2
  const [mood, setMood] = useState("");
  const [rephrasing, setRephrasing] = useState(false);
  const [rephraseError, setRephraseError] = useState("");
  const [rephrasedTitle, setRephrasedTitle] = useState("");
  const [rephrasedBody, setRephrasedBody] = useState("");
  const [factCheck, setFactCheck] = useState<FactCheck | null>(null);
  const [bodyMode, setBodyMode] = useState<"running" | "bullets">("running");

  // Stage 3
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [imageSource, setImageSource] = useState<"extracted" | "uploaded" | "">("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const hasOriginal = Boolean(originalTitle && originalBody);
  const currentTitle = rephrasedTitle || originalTitle;
  const currentBody = rephrasedBody || originalBody;

  async function extractFromLink() {
    if (!sourceUrl.trim()) {
      setExtractError("Enter a URL first.");
      return;
    }
    setExtracting(true);
    setExtractError("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Extraction failed.");
      setOriginalTitle(data.title || "");
      setOriginalBody(data.body || "");
      setSourceDomain(data.sourceDomain || "");
      setImages(data.images || []);
      if (!data.title || !data.body) {
        setShowManual(true);
      }
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : "Extraction failed.");
      setShowManual(true);
    } finally {
      setExtracting(false);
    }
  }

  function useManualText() {
    if (!manualTitle.trim() || !manualBody.trim()) return;
    setOriginalTitle(manualTitle.trim());
    setOriginalBody(manualBody.trim());
    if (!sourceDomain && sourceUrl) {
      try {
        setSourceDomain(new URL(sourceUrl).hostname.replace(/^www\./, ""));
      } catch {
        // ignore invalid URL, leave sourceDomain blank
      }
    }
  }

  async function createRephrase() {
    if (!mood || !hasOriginal) return;
    setRephrasing(true);
    setRephraseError("");
    try {
      const res = await fetch("/api/rephrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: originalTitle, body: originalBody, mood }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Rephrasing failed.");
      setRephrasedTitle(data.title || "");
      setRephrasedBody(data.body || "");

      const fcRes = await fetch("/api/fact-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalTitle,
          rephrasedTitle: data.title,
          originalBody,
          rephrasedBody: data.body,
        }),
      });
      const fcData = await fcRes.json();
      setFactCheck(fcData);
    } catch (err) {
      setRephraseError(err instanceof Error ? err.message : "Rephrasing failed.");
    } finally {
      setRephrasing(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed.");
      setSelectedImage(data.url);
      setImageSource("uploaded");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal";
  const labelClass = "block text-xs font-semibold text-slate mb-1.5";
  const stageNames = ["Extract", "Rephrase & Fact-Check", "Image", "Review & Publish"];

  if (stage === 4) {
    const initial: Partial<NewsCard & { originalTitle: string; originalBody: string }> = {
      headline: currentTitle,
      summary: currentBody,
      expanded: currentBody,
      sourceUrl,
      sourceDomain,
      sourceTitle: originalTitle,
      sourceOrg: sourceDomain,
      imageUrl: selectedImage || undefined,
      mood: mood as NewsCard["mood"],
      originalTitle,
      originalBody,
      bodyDisplayMode: bodyMode,
      imageSource: imageSource || undefined,
      factCheckTitleStatus: (factCheck?.title.status as FactCheckStatus) || undefined,
      factCheckTitleSummary: factCheck?.title.summary,
      factCheckBodyStatus: (factCheck?.body.status as FactCheckStatus) || undefined,
      factCheckBodySummary: factCheck?.body.summary,
      hasFactCheckWarning: factCheck?.hasWarning || false,
      audience: "both" as Audience,
    };

    return (
      <div>
        <button
          onClick={() => setStage(3)}
          className="text-xs font-semibold text-slate hover:text-navy mb-6"
        >
          ← Back to image selection
        </button>
        {factCheck?.hasWarning && (
          <div className="rounded-lg border border-caution/40 bg-caution/10 px-4 py-3 text-sm text-charcoal mb-6">
            <span className="font-semibold text-caution">Fact-check flagged this content — </span>
            review the summaries below before publishing. The rephrased text is prefilled, but you
            can edit anything before it goes live.
          </div>
        )}
        <CardForm specialties={specialties} initial={initial} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      {/* Stage indicator */}
      <div className="flex items-center gap-2 mb-8 text-xs font-semibold text-slate">
        {stageNames.map((name, i) => (
          <div key={name} className="flex items-center gap-2">
            <span
              className={`h-6 w-6 rounded-full flex items-center justify-center ${
                stage === i + 1 ? "bg-navy text-white" : "bg-offwhite text-slate"
              }`}
            >
              {i + 1}
            </span>
            <span className={stage === i + 1 ? "text-navy" : ""}>{name}</span>
            {i < stageNames.length - 1 && <span className="text-border mx-1">—</span>}
          </div>
        ))}
      </div>

      {stage === 1 && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Source article URL</label>
            <div className="flex gap-2">
              <input
                className={inputClass}
                placeholder="https://example.com/article"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
              <button
                onClick={extractFromLink}
                disabled={extracting}
                className="shrink-0 rounded-lg bg-navy text-white font-semibold px-4 py-2 text-sm hover:bg-teal transition-colors disabled:opacity-50"
              >
                {extracting ? "Extracting…" : "Extract"}
              </button>
            </div>
            {extractError && <p className="text-xs text-urgent mt-2">{extractError}</p>}
          </div>

          {hasOriginal && !showManual && (
            <div className="rounded-lg border border-border bg-offwhite p-4">
              <p className="text-xs font-semibold text-slate mb-2">
                Extracted from {sourceDomain}
              </p>
              <p className="font-heading font-semibold text-navy mb-2">{originalTitle}</p>
              <p className="text-sm text-charcoal">{originalBody}</p>
            </div>
          )}

          <button
            onClick={() => setShowManual((s) => !s)}
            className="text-xs font-semibold text-teal hover:underline"
          >
            {showManual ? "Hide manual entry" : "Extraction not working? Enter text manually"}
          </button>

          {showManual && (
            <div className="space-y-3 rounded-lg border border-border p-4">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  className={inputClass}
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>Body text</label>
                <textarea
                  rows={4}
                  className={inputClass}
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                />
              </div>
              <button
                onClick={useManualText}
                className="rounded-lg bg-navy text-white font-semibold px-4 py-2 text-sm hover:bg-teal transition-colors"
              >
                Use This Text
              </button>
            </div>
          )}

          <button
            onClick={() => setStage(2)}
            disabled={!hasOriginal}
            className="rounded-full bg-navy text-white font-semibold px-6 py-2.5 text-sm hover:bg-teal transition-colors disabled:opacity-40"
          >
            Continue to Rephrase
          </button>
        </div>
      )}

      {stage === 2 && (
        <div className="space-y-5">
          <div>
            <label className={labelClass}>Mood / tone</label>
            <select className={inputClass} value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="">Select a mood…</option>
              {MOODS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={createRephrase}
            disabled={!mood || rephrasing}
            className="rounded-lg bg-navy text-white font-semibold px-4 py-2 text-sm hover:bg-teal transition-colors disabled:opacity-40"
          >
            {rephrasing ? "Rephrasing…" : "Create Rephrased Version"}
          </button>
          {rephraseError && <p className="text-xs text-urgent">{rephraseError}</p>}

          {rephrasedTitle && (
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <p className="text-xs font-semibold text-slate mb-2">Original</p>
                <p className="font-heading font-semibold text-sm text-navy mb-2">
                  {originalTitle}
                </p>
                <p className="text-xs text-charcoal">{originalBody}</p>
              </div>
              <div className="rounded-lg border border-teal/40 bg-aqua/30 p-4">
                <p className="text-xs font-semibold text-teal mb-2">Rephrased ({mood})</p>
                <p className="font-heading font-semibold text-sm text-navy mb-2">
                  {rephrasedTitle}
                </p>
                <p className="text-xs text-charcoal">{rephrasedBody}</p>
              </div>
            </div>
          )}

          {factCheck && (
            <div className="grid sm:grid-cols-2 gap-4">
              <FactBadge label="Title" fact={factCheck.title} />
              <FactBadge label="Body" fact={factCheck.body} />
            </div>
          )}

          {rephrasedTitle && (
            <div>
              <label className={labelClass}>Body display style</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setBodyMode("running")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    bodyMode === "running"
                      ? "bg-navy text-white border-navy"
                      : "border-border text-slate"
                  }`}
                >
                  Running text
                </button>
                <button
                  onClick={() => setBodyMode("bullets")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    bodyMode === "bullets"
                      ? "bg-navy text-white border-navy"
                      : "border-border text-slate"
                  }`}
                >
                  Bullet points
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStage(1)}
              className="text-xs font-semibold text-slate hover:text-navy"
            >
              ← Back
            </button>
            <button
              onClick={() => setStage(3)}
              className="ml-auto rounded-full bg-navy text-white font-semibold px-6 py-2.5 text-sm hover:bg-teal transition-colors"
            >
              Continue to Image {rephrasedTitle ? "" : "(skip rephrasing)"}
            </button>
          </div>
        </div>
      )}

      {stage === 3 && (
        <div className="space-y-5">
          {images.length > 0 && (
            <div>
              <label className={labelClass}>Extracted images — click to select</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((src) => (
                  <button
                    key={src}
                    onClick={() => {
                      setSelectedImage(src);
                      setImageSource("extracted");
                    }}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      selectedImage === src ? "border-teal" : "border-border"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className={labelClass}>Or upload your own image</label>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} />
            {uploading && <p className="text-xs text-slate mt-1">Uploading…</p>}
            {uploadError && <p className="text-xs text-urgent mt-1">{uploadError}</p>}
          </div>

          {selectedImage && (
            <div>
              <p className={labelClass}>Selected image</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt=""
                className="w-full max-w-xs rounded-lg border border-border"
              />
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStage(2)}
              className="text-xs font-semibold text-slate hover:text-navy"
            >
              ← Back
            </button>
            <button
              onClick={() => setStage(4)}
              className="ml-auto rounded-full bg-navy text-white font-semibold px-6 py-2.5 text-sm hover:bg-teal transition-colors"
            >
              Continue to Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FactBadge({
  label,
  fact,
}: {
  label: string;
  fact: { status: "ok" | "warn"; summary: string };
}) {
  const ok = fact.status === "ok";
  return (
    <div
      className={`rounded-lg border p-3 text-xs ${
        ok ? "border-success/30 bg-success/10" : "border-caution/40 bg-caution/10"
      }`}
    >
      <p className={`font-semibold mb-1 ${ok ? "text-success" : "text-caution"}`}>
        {label} — {ok ? "Consistent" : "Needs review"}
      </p>
      <p className="text-charcoal">{fact.summary}</p>
    </div>
  );
}
