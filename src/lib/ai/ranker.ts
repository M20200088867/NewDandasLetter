import { getAnthropicClient } from "./client";
import type { RawArticle } from "@/types";

export async function rankArticles(
  articles: RawArticle[],
  themeNames: string[],
  maxResults: number = 10
): Promise<number[]> {
  const client = getAnthropicClient();

  const articleList = articles
    .map((a, i) => `[${i}] "${a.title}" — ${a.source} (Theme: ${a.themeName})`)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a news editor. Given these ${articles.length} articles, select the top ${maxResults} most important, reliable, and diverse articles.

Themes of interest: ${themeNames.join(", ")}

Criteria:
- Source reliability (prefer established outlets)
- Relevance to the themes
- Diversity (don't pick multiple articles about the same story)
- Recency and impact

Articles:
${articleList}

Return ONLY a JSON array of the selected article indices, ordered by importance. Example: [3, 7, 1, 15, 8, 0, 12, 5, 9, 2]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\d,\s]+\]/);
  if (!match) {
    // Fallback: return first N articles
    return articles.slice(0, maxResults).map((_, i) => i);
  }

  const indices: number[] = JSON.parse(match[0]);
  return indices.filter((i) => i >= 0 && i < articles.length).slice(0, maxResults);
}
