import { Pool } from "pg";
import type { Video, NewsCard, Specialty, FactCheckStatus } from "./types";
import specialtiesSeed from "@/data/specialties.json";
import videosSeed from "@/data/videos.json";
import cardsSeed from "@/data/cards.json";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.PRISMA_DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: connectionString?.includes("localhost")
        ? false
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = getPool();
  const res = await client.query(text, params);
  return res.rows as T[];
}

let initialized = false;

async function ensureSchema() {
  if (initialized) return;

  await query(`
    CREATE TABLE IF NOT EXISTS specialties (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      specialty TEXT NOT NULL,
      audience TEXT NOT NULL,
      video_type TEXT,
      speaker_name TEXT,
      speaker_credentials TEXT,
      institution TEXT,
      short_description TEXT,
      full_description TEXT,
      duration TEXT,
      tags TEXT,
      reviewer TEXT,
      published_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status TEXT NOT NULL DEFAULT 'published',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS cards (
      id TEXT PRIMARY KEY,
      headline TEXT NOT NULL,
      summary TEXT,
      expanded TEXT,
      specialty TEXT NOT NULL,
      audience TEXT NOT NULL,
      content_type TEXT,
      key_findings TEXT,
      clinical_relevance TEXT,
      limitation TEXT,
      source_title TEXT,
      source_org TEXT,
      source_url TEXT,
      published_date DATE NOT NULL DEFAULT CURRENT_DATE,
      related_video_id TEXT,
      status TEXT NOT NULL DEFAULT 'published',
      featured BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      mood TEXT,
      source_domain TEXT,
      original_title TEXT,
      original_body TEXT,
      body_display_mode TEXT,
      image_url TEXT,
      image_source TEXT,
      fact_check_title_status TEXT,
      fact_check_title_summary TEXT,
      fact_check_body_status TEXT,
      fact_check_body_summary TEXT,
      has_fact_check_warning BOOLEAN NOT NULL DEFAULT FALSE,
      manually_verified BOOLEAN NOT NULL DEFAULT FALSE,
      manually_verified_at TIMESTAMPTZ,
      reading_grade REAL
    );
  `);

  // Add any columns that may be missing on an existing table (safe to re-run)
  const newColumns: [string, string][] = [
    ["mood", "TEXT"],
    ["source_domain", "TEXT"],
    ["original_title", "TEXT"],
    ["original_body", "TEXT"],
    ["body_display_mode", "TEXT"],
    ["image_url", "TEXT"],
    ["image_source", "TEXT"],
    ["fact_check_title_status", "TEXT"],
    ["fact_check_title_summary", "TEXT"],
    ["fact_check_body_status", "TEXT"],
    ["fact_check_body_summary", "TEXT"],
    ["has_fact_check_warning", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["manually_verified", "BOOLEAN NOT NULL DEFAULT FALSE"],
    ["manually_verified_at", "TIMESTAMPTZ"],
    ["reading_grade", "REAL"],
  ];
  for (const [col, def] of newColumns) {
    await query(`ALTER TABLE cards ADD COLUMN IF NOT EXISTS ${col} ${def};`);
  }

  const specialtyCount = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM specialties;`
  );
  if (specialtyCount[0].count === 0) {
    for (const s of specialtiesSeed as Specialty[]) {
      await query(
        `INSERT INTO specialties (slug, name) VALUES ($1, $2) ON CONFLICT DO NOTHING;`,
        [s.slug, s.name]
      );
    }
  }

  const videoCount = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM videos;`
  );
  if (videoCount[0].count === 0) {
    for (const v of videosSeed as Video[]) {
      await insertVideo(v);
    }
  }

  const cardCount = await query<{ count: number }>(
    `SELECT COUNT(*)::int AS count FROM cards;`
  );
  if (cardCount[0].count === 0) {
    for (const c of cardsSeed as NewsCard[]) {
      await insertCard(c);
    }
  }

  initialized = true;
}

function rowToVideo(r: Record<string, unknown>): Video {
  return {
    id: r.id as string,
    title: r.title as string,
    url: r.url as string,
    specialty: r.specialty as string,
    audience: r.audience as Video["audience"],
    videoType: r.video_type as string,
    speakerName: r.speaker_name as string,
    speakerCredentials: r.speaker_credentials as string,
    institution: (r.institution as string) ?? undefined,
    shortDescription: r.short_description as string,
    fullDescription: (r.full_description as string) ?? undefined,
    duration: (r.duration as string) ?? undefined,
    tags: r.tags ? (r.tags as string).split("|||").filter(Boolean) : [],
    reviewer: (r.reviewer as string) ?? undefined,
    publishedDate: (r.published_date as Date).toISOString().slice(0, 10),
    status: r.status as Video["status"],
    featured: r.featured as boolean,
  };
}

function rowToCard(r: Record<string, unknown>): NewsCard {
  return {
    id: r.id as string,
    headline: r.headline as string,
    summary: r.summary as string,
    expanded: r.expanded as string,
    specialty: r.specialty as string,
    audience: r.audience as NewsCard["audience"],
    contentType: r.content_type as string,
    keyFindings: r.key_findings
      ? (r.key_findings as string).split("|||").filter(Boolean)
      : [],
    clinicalRelevance: r.clinical_relevance as string,
    limitation: r.limitation as string,
    sourceTitle: r.source_title as string,
    sourceOrg: r.source_org as string,
    sourceUrl: (r.source_url as string) ?? undefined,
    publishedDate: (r.published_date as Date).toISOString().slice(0, 10),
    relatedVideoId: (r.related_video_id as string) ?? undefined,
    status: r.status as NewsCard["status"],
    featured: r.featured as boolean,
    mood: (r.mood as NewsCard["mood"]) ?? undefined,
    sourceDomain: (r.source_domain as string) ?? undefined,
    originalTitle: (r.original_title as string) ?? undefined,
    originalBody: (r.original_body as string) ?? undefined,
    bodyDisplayMode: (r.body_display_mode as NewsCard["bodyDisplayMode"]) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    imageSource: (r.image_source as NewsCard["imageSource"]) ?? undefined,
    factCheckTitleStatus: (r.fact_check_title_status as FactCheckStatus) ?? undefined,
    factCheckTitleSummary: (r.fact_check_title_summary as string) ?? undefined,
    factCheckBodyStatus: (r.fact_check_body_status as FactCheckStatus) ?? undefined,
    factCheckBodySummary: (r.fact_check_body_summary as string) ?? undefined,
    hasFactCheckWarning: (r.has_fact_check_warning as boolean) ?? false,
    manuallyVerified: (r.manually_verified as boolean) ?? false,
    readingGrade: r.reading_grade != null ? Number(r.reading_grade) : undefined,
  };
}

async function insertVideo(v: Video) {
  await query(
    `INSERT INTO videos (
      id, title, url, specialty, audience, video_type, speaker_name,
      speaker_credentials, institution, short_description, full_description,
      duration, tags, reviewer, published_date, status, featured
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
    ON CONFLICT (id) DO NOTHING;`,
    [
      v.id,
      v.title,
      v.url,
      v.specialty,
      v.audience,
      v.videoType,
      v.speakerName,
      v.speakerCredentials,
      v.institution ?? null,
      v.shortDescription,
      v.fullDescription ?? null,
      v.duration ?? null,
      v.tags.join("|||"),
      v.reviewer ?? null,
      v.publishedDate,
      v.status,
      !!v.featured,
    ]
  );
}

async function insertCard(c: NewsCard) {
  await query(
    `INSERT INTO cards (
      id, headline, summary, expanded, specialty, audience, content_type,
      key_findings, clinical_relevance, limitation, source_title, source_org,
      source_url, published_date, related_video_id, status, featured,
      mood, source_domain, original_title, original_body, body_display_mode,
      image_url, image_source, fact_check_title_status, fact_check_title_summary,
      fact_check_body_status, fact_check_body_summary, has_fact_check_warning,
      manually_verified, reading_grade
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,
      $18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31
    )
    ON CONFLICT (id) DO NOTHING;`,
    [
      c.id,
      c.headline,
      c.summary,
      c.expanded,
      c.specialty,
      c.audience,
      c.contentType,
      c.keyFindings.join("|||"),
      c.clinicalRelevance,
      c.limitation,
      c.sourceTitle,
      c.sourceOrg,
      c.sourceUrl ?? null,
      c.publishedDate,
      c.relatedVideoId ?? null,
      c.status,
      !!c.featured,
      c.mood ?? null,
      c.sourceDomain ?? null,
      c.originalTitle ?? null,
      c.originalBody ?? null,
      c.bodyDisplayMode ?? null,
      c.imageUrl ?? null,
      c.imageSource ?? null,
      c.factCheckTitleStatus ?? null,
      c.factCheckTitleSummary ?? null,
      c.factCheckBodyStatus ?? null,
      c.factCheckBodySummary ?? null,
      !!c.hasFactCheckWarning,
      !!c.manuallyVerified,
      c.readingGrade ?? null,
    ]
  );
}

export async function getSpecialties(): Promise<Specialty[]> {
  await ensureSchema();
  return query<Specialty>(`SELECT slug, name FROM specialties ORDER BY name ASC;`);
}

export async function getVideos(): Promise<Video[]> {
  await ensureSchema();
  const rows = await query(`SELECT * FROM videos ORDER BY published_date DESC;`);
  return rows.map(rowToVideo);
}

export async function getPublishedVideos(): Promise<Video[]> {
  const videos = await getVideos();
  return videos.filter((v) => v.status === "published");
}

export async function getCards(): Promise<NewsCard[]> {
  await ensureSchema();
  const rows = await query(`SELECT * FROM cards ORDER BY published_date DESC;`);
  return rows.map(rowToCard);
}

export async function getPublishedCards(): Promise<NewsCard[]> {
  const cards = await getCards();
  return cards.filter((c) => c.status === "published");
}

export async function addVideo(video: Video) {
  await ensureSchema();
  await insertVideo(video);
}

export async function addCard(card: NewsCard) {
  await ensureSchema();
  await insertCard(card);
}
