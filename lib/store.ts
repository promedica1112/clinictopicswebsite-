import fs from "fs";
import path from "path";
import type { Video, NewsCard, Specialty } from "./types";

const dataDir = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  const filePath = path.join(dataDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function writeJson<T>(file: string, data: T) {
  const filePath = path.join(dataDir, file);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getSpecialties(): Specialty[] {
  return readJson<Specialty[]>("specialties.json");
}

export function getVideos(): Video[] {
  return readJson<Video[]>("videos.json");
}

export function getPublishedVideos(): Video[] {
  return getVideos().filter((v) => v.status === "published");
}

export function getCards(): NewsCard[] {
  return readJson<NewsCard[]>("cards.json");
}

export function getPublishedCards(): NewsCard[] {
  return getCards().filter((c) => c.status === "published");
}

export function addVideo(video: Video) {
  const videos = getVideos();
  videos.unshift(video);
  writeJson("videos.json", videos);
}

export function addCard(card: NewsCard) {
  const cards = getCards();
  cards.unshift(card);
  writeJson("cards.json", cards);
}
