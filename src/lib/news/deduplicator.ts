import type { RawArticle } from "@/types";

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function areSimilar(a: string, b: string): boolean {
  const normA = normalizeTitle(a);
  const normB = normalizeTitle(b);

  if (normA === normB) return true;

  // Check if one title contains 80%+ of the other's words
  const wordsA = new Set(normA.split(" "));
  const wordsB = new Set(normB.split(" "));
  const smaller = wordsA.size < wordsB.size ? wordsA : wordsB;
  const larger = wordsA.size < wordsB.size ? wordsB : wordsA;

  let matches = 0;
  for (const word of smaller) {
    if (larger.has(word)) matches++;
  }

  return smaller.size > 0 && matches / smaller.size >= 0.8;
}

export function deduplicateArticles(articles: RawArticle[]): RawArticle[] {
  const seen = new Set<string>();
  const result: RawArticle[] = [];

  for (const article of articles) {
    // Skip exact URL duplicates
    if (seen.has(article.link)) continue;
    seen.add(article.link);

    // Skip articles with very similar titles
    const isDuplicate = result.some((existing) =>
      areSimilar(existing.title, article.title)
    );
    if (isDuplicate) continue;

    result.push(article);
  }

  return result;
}
