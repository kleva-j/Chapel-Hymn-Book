#!/usr/bin/env node
/**
 * Parse hymn.docx → apps/native/assets/data/hymns.json
 *
 * Strategy: docx is a ZIP. Extract word/document.xml via `unzip -p`, then
 * regex-walk <w:p> paragraphs. Identify hymn headers by center alignment +
 * leading "<number>  <TITLE>" pattern. Chorus = bold paragraphs after header
 * before first verse. Verses = paragraphs starting with `\d+\)`.
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "..");
const DOCX_PATH = join(REPO_ROOT, "hymn.docx");
const OUTPUT_PATH = join(
  REPO_ROOT,
  "apps/native/assets/data/hymns.json",
);

function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function extractParagraphs(xml) {
  const paraRe = /<w:p[ >][\s\S]*?<\/w:p>/g;
  const paragraphs = [];
  let match;
  while ((match = paraRe.exec(xml)) !== null) {
    const block = match[0];
    const isCenter = /<w:jc w:val="center"/.test(block);
    const isBold =
      /<w:b\s*\/>/.test(block) || /<w:b\s+w:val="(?:true|1)"/.test(block);
    const styleMatch = block.match(/<w:pStyle w:val="([^"]+)"/);
    const style = styleMatch ? styleMatch[1] : "default";

    // Collect text runs with <w:cr/> as newline markers.
    // Approach: walk the content sequentially.
    const inner = block;
    const tokens = [];
    const tokenRe = /<w:t[^>]*>([^<]*)<\/w:t>|<w:cr\s*\/>|<w:br\s*\/>|<w:tab\s*\/>/g;
    let tm;
    while ((tm = tokenRe.exec(inner)) !== null) {
      if (tm[1] !== undefined) {
        tokens.push(decodeXmlEntities(tm[1]));
      } else if (tm[0].startsWith("<w:cr") || tm[0].startsWith("<w:br")) {
        tokens.push("\n");
      } else if (tm[0].startsWith("<w:tab")) {
        tokens.push("\t");
      }
    }
    const text = tokens.join("").replace(/\t+/g, " ").trim();
    paragraphs.push({ text, isCenter, isBold, style });
  }
  return paragraphs;
}

function normalizeLanguage(raw) {
  const cleaned = raw.trim();
  if (!cleaned) return null;
  // Title-case: "YORUBA" → "Yoruba", "hausa" → "Hausa"
  return cleaned
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// English vocabulary used to heuristically classify a title as English when no
// explicit `(LANGUAGE)` marker is present. Mix of stop-words, hymn/worship
// vocabulary, and common verbs/nouns. Lowercase, exact-match per token.
const ENGLISH_WORDS = new Set([
  // articles, prepositions, conjunctions, pronouns
  "a", "an", "the", "and", "or", "but", "of", "in", "on", "at", "to", "for",
  "with", "by", "from", "as", "into", "out", "up", "down", "over", "under",
  "i", "you", "we", "he", "she", "it", "they", "me", "us", "my", "your",
  "our", "his", "her", "their", "this", "that", "these", "those", "who",
  "what", "when", "where", "why", "how", "all", "no", "not", "yes", "any",
  // be / have / modal verbs
  "is", "are", "was", "were", "be", "been", "being", "am",
  "have", "has", "had", "will", "would", "can", "could", "should", "shall",
  "do", "does", "did", "may", "might", "must", "let",
  // common verbs
  "come", "go", "see", "make", "made", "give", "given", "take", "say",
  "said", "sing", "sings", "sang", "sung", "hear", "speak", "spoke", "love",
  "loves", "loved", "lift", "raise", "fall", "stand", "kneel", "pray",
  "live", "lives", "lived", "die", "died", "rise", "risen", "send",
  "bring", "tell", "told", "know", "knew", "seek", "find", "found",
  "follow", "lead", "save", "saved", "trust", "rest", "wait", "watch",
  "walk", "run", "fight", "win", "open", "close",
  // worship / hymn vocabulary
  "lord", "god", "jesus", "christ", "holy", "spirit", "father", "son",
  "saviour", "savior", "redeemer", "king", "kingdom", "mercy", "grace",
  "amazing", "glorious", "wonderful", "majestic", "sovereign", "almighty",
  "praise", "glory", "honour", "honor", "worship", "blessed", "blessing",
  "hallelujah", "alleluia", "amen", "hosanna", "victory", "triumph",
  "mighty", "fortress", "rock", "shepherd", "lamb", "throne", "salvation",
  "righteousness", "righteous", "saved", "born", "again", "new", "old",
  "true", "truth", "way", "life", "light", "darkness", "awesome",
  "faith", "hope", "peace", "joy", "love",
  "soul", "heart", "spirit", "name", "song", "voice", "world", "heaven",
  "earth", "kingdom", "cross", "blood", "water", "fire", "morning",
  "evening", "day", "night", "year", "today", "forever", "eternal",
  "everlasting", "thee", "thou", "thy", "thine", "unto", "above", "below",
  // common adjectives
  "great", "good", "high", "low", "near", "far", "long", "short",
  "strong", "wise", "true", "fair", "rich", "poor", "young", "old",
  // common nouns from hymn titles
  "hymn", "song", "psalm", "anthem", "chorus", "verse", "refrain",
  "church", "chapel", "altar", "bread", "wine", "lamb", "manger", "star",
  "shepherd", "stable", "child", "mother", "mary", "joseph",
  // more catch-alls for hymn titles
  "behold", "prayer", "prayers", "benediction", "communion", "trinity",
  "father", "son", "ghost", "angel", "angels", "cherub", "bethlehem",
  "calvary", "zion", "jerusalem", "israel", "alpha", "omega", "gospel",
  "bible", "scripture", "word", "rejoice", "wake", "awake", "arise",
]);

function looksEnglish(title) {
  // Normalize curly quotes to straight before tokenizing.
  const normalized = title.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  const words = normalized
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean);
  if (words.length === 0) return false;
  return words.some((w) => ENGLISH_WORDS.has(w));
}

function extractLanguage(title) {
  // Strip any trailing `(LANGUAGE)` group.
  const m = title.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (m) {
    return {
      title: m[1].trim(),
      language: normalizeLanguage(m[2]),
    };
  }
  // No parenthetical: detect English heuristically, otherwise unknown.
  return {
    title: title.trim(),
    language: looksEnglish(title) ? "English" : null,
  };
}

// Hymn header: text starts with digits (possibly with internal spaces from OCR)
// followed by 2+ spaces then a TITLE in caps. Allow Heading1 style as well.
function parseHeader(p) {
  if (!p.text) return null;
  const looksLikeHeader =
    p.isCenter || /^Heading\d/.test(p.style);
  if (!looksLikeHeader) return null;

  // Match leading digit cluster (with optional internal single spaces), then 2+ spaces, then rest
  const m = p.text.match(/^([\d](?:[\d ]*[\d])?)\s{2,}(.+)$/);
  if (!m) return null;

  const numberStr = m[1].replace(/\s+/g, "");
  const number = Number.parseInt(numberStr, 10);
  if (!Number.isFinite(number) || number < 1 || number > 9999) return null;

  const { title, language } = extractLanguage(m[2].trim());
  return { number, title, language };
}

function isVerseStart(text) {
  return /^\d+\)/.test(text);
}

function stripVerseMarker(text) {
  return text.replace(/^\d+\)\s*/, "");
}

function parseHymns(paragraphs) {
  const hymns = [];
  let current = null; // { number, title, chorusLines, verses: string[][], state }
  // state: 'preverse' | 'inverse'

  function flush() {
    if (!current) return;
    const chorus = current.chorusLines.join("\n").trim() || undefined;
    const verses = current.verses
      .map((lines) => lines.join("\n").trim())
      .filter((v) => v.length > 0);
    const content = [chorus, ...verses].filter(Boolean).join("\n\n");
    hymns.push({
      number: current.number,
      title: current.title,
      language: current.language,
      chorus,
      verses,
      content,
    });
  }

  for (const p of paragraphs) {
    const header = parseHeader(p);
    if (header) {
      flush();
      current = {
        number: header.number,
        title: header.title,
        language: header.language,
        chorusLines: [],
        verses: [],
        state: "preverse",
      };
      continue;
    }
    if (!current) continue;
    if (!p.text) continue;

    // Split paragraph into logical lines — verse markers can be inline via <w:cr/>
    const lines = p.text
      .split(/\n+/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of lines) {
      if (isVerseStart(line)) {
        current.state = "inverse";
        current.verses.push([stripVerseMarker(line)]);
        continue;
      }
      if (current.state === "preverse") {
        // Anything before first verse marker → chorus
        current.chorusLines.push(line);
      } else {
        const last = current.verses[current.verses.length - 1];
        last.push(line);
      }
    }
  }
  flush();
  return hymns;
}

function main() {
  console.log(`Reading ${DOCX_PATH}...`);
  const xml = execSync(`unzip -p "${DOCX_PATH}" word/document.xml`, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });

  console.log(`Extracting paragraphs...`);
  const paragraphs = extractParagraphs(xml);
  console.log(`  ${paragraphs.length} paragraphs`);

  console.log(`Parsing hymns...`);
  const hymns = parseHymns(paragraphs);
  console.log(`  ${hymns.length} hymns parsed`);

  // Deduplicate by number — keep first occurrence (handles OCR-duplicate headers)
  const seen = new Set();
  const unique = [];
  for (const h of hymns) {
    if (seen.has(h.number)) continue;
    seen.add(h.number);
    unique.push(h);
  }
  unique.sort((a, b) => a.number - b.number);
  console.log(`  ${unique.length} unique hymns after dedupe`);

  // Stats
  const withChorus = unique.filter((h) => h.chorus).length;
  const totalVerses = unique.reduce((s, h) => s + h.verses.length, 0);
  console.log(
    `  ${withChorus} hymns have chorus; ${totalVerses} total verses`,
  );
  const byLang = unique.reduce((acc, h) => {
    acc[h.language] = (acc[h.language] || 0) + 1;
    return acc;
  }, {});
  console.log("  Languages:", JSON.stringify(byLang));

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, JSON.stringify(unique, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
}

main();
