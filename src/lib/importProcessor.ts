import type { DateConfidence } from "../types";

export interface DateResult {
  date: string;
  confidence: DateConfidence;
  source: "filename" | "frontmatter" | "text" | "importedAt";
}

export interface FrontmatterResult {
  date: string | null;
  title: string | null;
  tags: string[];
  body: string;
}

export interface ProcessedFile {
  title: string;
  content: string;
  contentHash: string;
  eventDate: string;
  dateConfidence: DateConfidence;
  dateSource: "filename" | "frontmatter" | "text" | "importedAt";
  sourceFile: string;
  tags: string[];
}

export async function computeContentHash(text: string): Promise<string> {
  const normalized = text.trim().replace(/\s+/g, " ");
  const encoder = new TextEncoder();
  const data = encoder.encode(normalized);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .substring(0, 16);
}

const MONTHS_PT: Record<string, string> = {
  janeiro: "01", jan: "01",
  fevereiro: "02", fev: "02",
  março: "03", marco: "03", mar: "03",
  abril: "04", abr: "04",
  maio: "05",
  junho: "06", jun: "06",
  julho: "07", jul: "07",
  agosto: "08", ago: "08",
  setembro: "09", set: "09",
  outubro: "10", out: "10",
  novembro: "11", nov: "11",
  dezembro: "12", dez: "12",
};

export function extractDateFromFilename(filename: string): DateResult | null {
  const name = filename.replace(/\.[^.]+$/, "").toLowerCase();

  // YYYY-MM-DD or YYYY_MM_DD
  const isoFull = name.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (isoFull) {
    return {
      date: `${isoFull[1]}-${isoFull[2]}-${isoFull[3]}`,
      confidence: "exact",
      source: "filename",
    };
  }

  // DD-MM-YYYY or DD_MM_YYYY
  const brFull = name.match(/(\d{2})[-_](\d{2})[-_](\d{4})/);
  if (brFull) {
    return {
      date: `${brFull[3]}-${brFull[2]}-${brFull[1]}`,
      confidence: "exact",
      source: "filename",
    };
  }

  // YYYYMMDD
  const compact = name.match(/\b(\d{4})(\d{2})(\d{2})\b/);
  if (compact) {
    return {
      date: `${compact[1]}-${compact[2]}-${compact[3]}`,
      confidence: "exact",
      source: "filename",
    };
  }

  // YYYY-MM (estimated)
  const yearMonth = name.match(/(\d{4})[-_](\d{2})\b/);
  if (yearMonth) {
    return {
      date: `${yearMonth[1]}-${yearMonth[2]}-01`,
      confidence: "estimated",
      source: "filename",
    };
  }

  // Month name + year (e.g. jan-2023 or janeiro-2023)
  for (const [monthName, monthNum] of Object.entries(MONTHS_PT)) {
    const mY = name.match(new RegExp(`${monthName}[-_\\s]*(\\d{4})`));
    if (mY) return { date: `${mY[1]}-${monthNum}-01`, confidence: "estimated", source: "filename" };
    const Ym = name.match(new RegExp(`(\\d{4})[-_\\s]*${monthName}`));
    if (Ym) return { date: `${Ym[1]}-${monthNum}-01`, confidence: "estimated", source: "filename" };
  }

  // Bare year
  const yearOnly = name.match(/\b(20\d{2})\b/);
  if (yearOnly) {
    return { date: `${yearOnly[1]}-01-01`, confidence: "estimated", source: "filename" };
  }

  return null;
}

export function parseFrontmatter(content: string): FrontmatterResult {
  const result: FrontmatterResult = { date: null, title: null, tags: [], body: content };

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!fmMatch) return result;

  const yaml = fmMatch[1];
  result.body = fmMatch[2];

  const dateMatch = yaml.match(
    /(?:date|data|date_created|criado_em|created|created_at):\s*["']?(\d{4}-\d{2}-\d{2})["']?/i
  );
  if (dateMatch) result.date = dateMatch[1];

  const titleMatch = yaml.match(/title:\s*["']?(.+?)["']?\s*$/mi);
  if (titleMatch) result.title = titleMatch[1].trim();

  // tags: [a, b, c]
  const tagsInline = yaml.match(/tags:\s*\[([^\]]*)\]/);
  if (tagsInline) {
    result.tags = tagsInline[1]
      .split(",")
      .map((t) => t.trim().replace(/["']/g, ""))
      .filter(Boolean);
  }

  return result;
}

export function extractDateFromText(content: string): DateResult | null {
  const sample = content.split("\n").slice(0, 20).join("\n");

  // ISO date
  const iso = sample.match(/\b(\d{4})-(\d{2})-(\d{2})\b/);
  if (iso) {
    return { date: `${iso[1]}-${iso[2]}-${iso[3]}`, confidence: "exact", source: "text" };
  }

  // Brazilian: 15/01/2023 or 15-01-2023
  const br = sample.match(/\b(\d{1,2})[\/\-](\d{2})[\/\-](\d{4})\b/);
  if (br) {
    return {
      date: `${br[3]}-${br[2].padStart(2, "0")}-${br[1].padStart(2, "0")}`,
      confidence: "exact",
      source: "text",
    };
  }

  // "15 de janeiro de 2023"
  for (const [monthName, monthNum] of Object.entries(MONTHS_PT)) {
    const long = sample.match(
      new RegExp(`(\\d{1,2})\\s+de\\s+${monthName}\\s+de\\s+(\\d{4})`, "i")
    );
    if (long) {
      return {
        date: `${long[2]}-${monthNum}-${long[1].padStart(2, "0")}`,
        confidence: "exact",
        source: "text",
      };
    }
  }

  return null;
}

export function extractTitle(
  filename: string,
  frontmatterTitle: string | null,
  body: string
): string {
  if (frontmatterTitle) return frontmatterTitle;

  const h1 = body.match(/^#\s+(.+)$/m);
  if (h1) return h1[1].trim();

  const firstLine = body.trim().split("\n")[0];
  if (firstLine && firstLine.length < 120)
    return firstLine.replace(/^[#\s]+/, "").trim();

  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .trim();
}

export async function processMarkdownFile(
  file: File,
  importedAt: string
): Promise<ProcessedFile> {
  const rawContent = await file.text();
  const contentHash = await computeContentHash(rawContent);

  const { date: fmDate, title: fmTitle, tags, body } = parseFrontmatter(rawContent);
  const title = extractTitle(file.name, fmTitle, body);

  let dateResult: DateResult | null = null;

  if (fmDate) {
    dateResult = { date: fmDate, confidence: "exact", source: "frontmatter" };
  }
  if (!dateResult) dateResult = extractDateFromFilename(file.name);
  if (!dateResult) dateResult = extractDateFromText(body);
  if (!dateResult) {
    dateResult = {
      date: importedAt.substring(0, 10),
      confidence: "unknown",
      source: "importedAt",
    };
  }

  return {
    title,
    content: rawContent,
    contentHash,
    eventDate: dateResult.date,
    dateConfidence: dateResult.confidence,
    dateSource: dateResult.source,
    sourceFile: file.name,
    tags,
  };
}
