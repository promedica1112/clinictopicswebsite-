const OPENAI_MODEL = "gpt-4o-mini";

const MOOD_GUIDANCE: Record<string, string> = {
  Neutral: "balanced, factual, non-promotional, clear",
  Professional: "polished, concise, professional medical-news style",
  Promotional:
    "positive and engaging while avoiding exaggeration, unsupported superiority, or added claims",
  "Simplified Patient-Friendly":
    "plain-language, accessible to non-specialists, medically accurate",
  "Academic/Physician-Facing": "specialist-level, evidence-oriented, clinically precise",
  Conversational: "natural, readable, and approachable without losing accuracy",
  Creative: "fresh and engaging while preserving all medical facts",
  Serious: "formal, restrained, clinically sober",
  Empathetic: "sensitive, patient-aware, reassuring, and factual",
};

type ChatMessage = { role: "system" | "user"; content: string };

async function callOpenAI(
  messages: ChatMessage[],
  temperature = 0.3,
  jsonMode = false
): Promise<string> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error("OpenAI is not configured on this server yet.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages,
      temperature,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    let message = `OpenAI API error ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error?.message) message = data.error.message;
    } catch {
      // ignore parse failure, use default message
    }
    throw new Error(message);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || "";
}

function safeJsonParse(content: string): Record<string, unknown> {
  const trimmed = (content || "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  throw new Error("Could not parse the AI's response.");
}

export async function rephraseTitleAndBody(
  title: string,
  body: string,
  mood: string
): Promise<{ title: string; body: string }> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a clinically precise medical-news editor. Preserve factual meaning, entities, numbers, study qualifiers, dates, causality, uncertainty, and safety context. Do not introduce new claims. Return valid JSON only.",
    },
    {
      role: "user",
      content: `Rephrase BOTH the title and the body text using the same selected mood.

Selected mood: ${mood}
Mood guidance: ${MOOD_GUIDANCE[mood] || mood}

Rules:
- Preserve all facts, numbers, clinical qualifiers, populations, endpoints, dates, and causal relationships.
- Do not add claims, mechanisms, benefits, risks, statistics, or clinical implications not present in the original.
- Title: one concise headline.
- Body: keep approximately the same character length as the original body text, ideally 380-480 characters unless the original is shorter.
- Return JSON with exactly these keys: title, body.

Original title:
${title}

Original body text:
${body}`,
    },
  ];

  const content = await callOpenAI(messages, 0.55, true);
  const parsed = safeJsonParse(content);
  return {
    title: (parsed.title as string) || "",
    body: (parsed.body as string) || "",
  };
}

export type FactCheckResult = {
  title: { status: "ok" | "warn"; summary: string };
  body: { status: "ok" | "warn"; summary: string };
  hasWarning: boolean;
};

export async function factCheckRephrase(
  originalTitle: string,
  rephrasedTitle: string,
  originalBody: string,
  rephrasedBody: string
): Promise<FactCheckResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a strict factual consistency checker for medical communication. Flag factual drift, added claims, omitted critical qualifiers, changed numbers, altered causality, or unsupported clinical implications. Return valid JSON only.",
    },
    {
      role: "user",
      content: `Compare original vs rephrased content for factual consistency. Do not judge style.

Return JSON exactly in this shape:
{
  "title": {"status": "ok" or "warn", "summary": "brief reason"},
  "body": {"status": "ok" or "warn", "summary": "brief reason"}
}

Original title:
${originalTitle}

Rephrased title:
${rephrasedTitle}

Original body:
${originalBody}

Rephrased body:
${rephrasedBody}`,
    },
  ];

  try {
    const content = await callOpenAI(messages, 0.1, true);
    const parsed = safeJsonParse(content) as {
      title?: { status?: string; summary?: string };
      body?: { status?: string; summary?: string };
    };
    const normalize = (
      fact: { status?: string; summary?: string } | undefined,
      label: string
    ) => ({
      status: (fact?.status === "ok" ? "ok" : "warn") as "ok" | "warn",
      summary: (fact?.summary || `${label} requires manual review.`).trim(),
    });
    const titleResult = normalize(parsed.title, "Title");
    const bodyResult = normalize(parsed.body, "Body");
    return {
      title: titleResult,
      body: bodyResult,
      hasWarning: titleResult.status === "warn" || bodyResult.status === "warn",
    };
  } catch (error) {
    const message =
      "Fact-check could not be completed: " +
      (error instanceof Error ? error.message : String(error));
    return {
      title: { status: "warn", summary: message },
      body: { status: "warn", summary: message },
      hasWarning: true,
    };
  }
}

export function readingLevelSummary(text: string): {
  grade: number;
  band: string;
  wordCount: number;
  charCount: number;
} {
  const clean = text.replace(/\s+/g, " ").trim();
  const sentences = Math.max((clean.match(/[.!?]+/g) || []).length, 1);
  const words = clean.match(/\b[\w'-]+\b/g) || [];
  const wordCount = Math.max(words.length, 1);
  const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const grade = Math.max(
    0,
    0.39 * (wordCount / sentences) + 11.8 * (syllableCount / wordCount) - 15.59
  );
  const band =
    grade <= 6
      ? "patient-friendly/easy"
      : grade <= 9
      ? "general reader"
      : grade <= 12
      ? "professional"
      : "specialist/academic";
  return { grade: Number(grade.toFixed(1)), band, wordCount, charCount: clean.length };
}

function countSyllables(word: string): number {
  const normalized = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!normalized) return 1;
  if (normalized.length <= 3) return 1;
  const withoutSilentE = normalized.replace(/e$/, "");
  const groups = withoutSilentE.match(/[aeiouy]+/g);
  return Math.max(groups ? groups.length : 1, 1);
}
