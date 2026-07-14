import dns from "dns/promises";
import net from "net";
import * as cheerio from "cheerio";

const BODY_TARGET_CHARS = 440;
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB
const FETCH_TIMEOUT_MS = 10000;
const MAX_IMAGES = 24;

export type ExtractedArticle = {
  title: string;
  body: string;
  images: string[];
  sourceDomain: string;
};

class ExtractionError extends Error {}

function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split(".").map(Number);
    const [a, b] = parts;
    if (a === 127) return true; // loopback
    if (a === 10) return true; // private
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 169 && b === 254) return true; // link-local / cloud metadata
    if (a === 0) return true;
    return false;
  }
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower === "::1") return true; // loopback
    if (lower.startsWith("fe80:")) return true; // link-local
    if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // unique local
    return false;
  }
  return false;
}

async function assertSafeUrl(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new ExtractionError("That doesn't look like a valid URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new ExtractionError("Only http and https URLs are allowed.");
  }

  const hostname = url.hostname.toLowerCase();
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "metadata.google.internal"
  ) {
    throw new ExtractionError("This URL points to a restricted host.");
  }

  // If hostname is already a literal IP, check it directly.
  if (net.isIP(hostname)) {
    if (isPrivateIp(hostname)) {
      throw new ExtractionError("This URL points to a restricted network address.");
    }
    return url;
  }

  // Otherwise resolve DNS and check every resolved address.
  let addresses: string[];
  try {
    const results = await dns.lookup(hostname, { all: true });
    addresses = results.map((r) => r.address);
  } catch {
    throw new ExtractionError("Could not resolve this domain.");
  }

  if (addresses.length === 0 || addresses.some(isPrivateIp)) {
    throw new ExtractionError("This URL points to a restricted network address.");
  }

  return url;
}

export async function extractArticle(rawUrl: string): Promise<ExtractedArticle> {
  const url = await assertSafeUrl(rawUrl);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let html: string;
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ClinicTopicsBot/1.0; +https://clinictopicswebsite.vercel.app)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      throw new ExtractionError(`The source site returned an error (${res.status}).`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("xhtml")) {
      throw new ExtractionError("That URL doesn't appear to be a web page.");
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > MAX_RESPONSE_BYTES) {
      throw new ExtractionError("The source page is too large to process.");
    }

    const reader = res.body?.getReader();
    if (!reader) {
      html = await res.text();
    } else {
      const chunks: Uint8Array[] = [];
      let total = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          total += value.length;
          if (total > MAX_RESPONSE_BYTES) {
            throw new ExtractionError("The source page is too large to process.");
          }
          chunks.push(value);
        }
      }
      html = Buffer.concat(chunks).toString("utf-8");
    }
  } catch (err) {
    if (err instanceof ExtractionError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ExtractionError("The source site took too long to respond.");
    }
    throw new ExtractionError("Could not fetch that URL.");
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, noscript, nav, footer, header, form, iframe, aside").remove();
  $(
    "[class*='cookie'], [class*='advert'], [class*='banner'], [class*='newsletter'], [id*='cookie']"
  ).remove();

  const ogTitle = $('meta[property="og:title"]').attr("content");
  const title = (ogTitle || $("title").first().text() || $("h1").first().text() || "").trim();

  let bodyText = "";
  const articleEl = $("article").first();
  const container = articleEl.length ? articleEl : $("body");
  const paragraphs = container
    .find("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((t) => t.length > 40);

  bodyText = paragraphs.join(" ").replace(/\s+/g, " ").trim();
  if (bodyText.length > BODY_TARGET_CHARS) {
    bodyText = bodyText.slice(0, BODY_TARGET_CHARS).replace(/\s+\S*$/, "") + "…";
  }

  const images = new Set<string>();
  const ogImage = $('meta[property="og:image"]').attr("content");
  if (ogImage) images.add(resolveUrl(ogImage, url));

  container.find("img").each((_, el) => {
    if (images.size >= MAX_IMAGES) return;
    const src = $(el).attr("src") || $(el).attr("data-src");
    if (src) {
      try {
        images.add(resolveUrl(src, url));
      } catch {
        // ignore invalid image URLs
      }
    }
  });

  if (!title && !bodyText) {
    throw new ExtractionError(
      "Couldn't extract readable content from this page. Try the manual fallback instead."
    );
  }

  return {
    title,
    body: bodyText,
    images: Array.from(images).slice(0, MAX_IMAGES),
    sourceDomain: url.hostname.replace(/^www\./, ""),
  };
}

function resolveUrl(src: string, base: URL): string {
  return new URL(src, base).toString();
}

export { ExtractionError };
