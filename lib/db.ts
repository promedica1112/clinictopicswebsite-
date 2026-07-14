import { sql } from "@vercel/postgres";
import type { Video, NewsCard, Specialty } from "./types";
import specialtiesSeed from "@/data/specialties.json";
import videosSeed from "@/data/videos.json";
import cardsSeed from "@/data/cards.json";

let initialized = false;

async function ensureSchema() {
  if (initialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS specialties (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL
    );
  `;

  await sql`
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
  `;

  await sql`
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  const { rows: specialtyCount } = await sql`SELECT COUNT(*)::int AS count FROM specialties;`;
  if (specialtyCount[0].count === 0) {
    for (const s of specialtiesSeed as Specialty[]) {
      await sql`INSERT INTO specialties (slug, name) VALUES (${s.slug}, ${s.name}) ON CONFLICT DO NOTHING;`;
    }
  }

  const { rows: videoCount } = await sql`SELECT COUNT(*)::int AS count FROM videos;`;
  if (videoCount[0].count === 0) {
    for (const v of videosSeed as Video[]) {
      await insertVideo(v);
    }
  }

  const { rows: cardCount } = await sql`SELECT COUNT(*)::int AS count FROM cards;`;
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
    keyFindings: r.key_findings ? (r.key_findings as string).split("|||").filter(Boolean) : [],
    clinicalRelevance: r.clinical_relevance as string,
    limitation: r.limitation as string,
    sourceTitle: r.source_title as string,
    sourceOrg: r.source_org as string,
    sourceUrl: (r.source_url as string) ?? undefined,
    publishedDate: (r.published_date as Date).toISOString().slice(0, 10),
    relatedVideoId: (r.related_video_id as string) ?? undefined,
    status: r.status as NewsCard["status"],
    featured: r.featured as boolean,
  };
}

async function insertVideo(v: Video) {
  await sql`
    INSERT INTO videos (
      id, title, url, specialty, audience, video_type, speaker_name,
      speaker_credentials, institution, short_description, full_description,
      duration, tags, reviewer, published_date, status, featured
    ) VALUES (
      ${v.id}, ${v.title}, ${v.url}, ${v.specialty}, ${v.audience}, ${v.videoType},
      ${v.speakerName}, ${v.speakerCredentials}, ${v.institution ?? null},
      ${v.shortDescription}, ${v.fullDescription ?? null}, ${v.duration ?? null},
      ${v.tags.join("|||")}, ${v.reviewer ?? null}, ${v.publishedDate}, ${v.status}, ${!!v.featured}
    )
    ON CONFLICT (id) DO NOTHING;
  `;
}

async function insertCard(c: NewsCard) {
  await sql`
    INSERT INTO cards (
      id, headline, summary, expanded, specialty, audience, content_type,
      key_findings, clinical_relevance, limitation, source_title, source_org,
      source_url, published_date, related_video_id, status, featured
    ) VALUES (
      ${c.id}, ${c.headline}, ${c.summary}, ${c.expanded}, ${c.specialty}, ${c.audience},
      ${c.contentType}, ${c.keyFindings.join("|||")}, ${c.clinicalRelevance}, ${c.limitation},
      ${c.sourceTitle}, ${c.sourceOrg}, ${c.sourceUrl ?? null}, ${c.publishedDate},
      ${c.relatedVideoId ?? null}, ${c.status}, ${!!c.featured}
    )
    ON CONFLICT (id) DO NOTHING;
  `;
}

export async function getSpecialties(): Promise<Specialty[]> {
  await ensureSchema();
  const { rows } = await sql`SELECT slug, name FROM specialties ORDER BY name ASC;`;
  return rows as Specialty[];
}

export async function getVideos(): Promise<Video[]> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM videos ORDER BY published_date DESC;`;
  return rows.map(rowToVideo);
}

export async function getPublishedVideos(): Promise<Video[]> {
  const videos = await getVideos();
  return videos.filter((v) => v.status === "published");
}

export async function getCards(): Promise<NewsCard[]> {
  await ensureSchema();
  const { rows } = await sql`SELECT * FROM cards ORDER BY published_date DESC;`;
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
