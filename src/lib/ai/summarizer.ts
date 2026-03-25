import { getAnthropicClient } from "./client";
import type { RawArticle } from "@/types";

interface SummarizedArticle {
  index: number;
  headline: string;
  summary: string;
}

export async function summarizeArticles(
  articles: RawArticle[],
  language: "en" | "pt-BR"
): Promise<SummarizedArticle[]> {
  const client = getAnthropicClient();

  const articleList = articles
    .map(
      (a, i) =>
        `[${i}] Title: "${a.title}"\nSource: ${a.source}\nDescription: ${a.description}`
    )
    .join("\n\n");

  const langInstruction =
    language === "pt-BR"
      ? "Write all summaries and headlines in Brazilian Portuguese."
      : "Write all summaries and headlines in English.";

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20241022",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are a professional news summarizer. Summarize each of these ${articles.length} articles.

${langInstruction}

For each article, provide:
- A concise, engaging headline (rewrite if needed for clarity)
- A 2-3 sentence summary that captures the key facts

Articles:
${articleList}

Return ONLY a JSON array with objects: [{"index": 0, "headline": "...", "summary": "..."}, ...]`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) {
    // Fallback: use original titles
    return articles.map((a, i) => ({
      index: i,
      headline: a.title,
      summary: a.description || "No summary available.",
    }));
  }

  return JSON.parse(match[0]);
}
