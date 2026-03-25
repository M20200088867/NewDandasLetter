import type { Theme, RawArticle } from "@/types";
import { parseRSSFeed } from "./rss-parser";

function buildGoogleNewsUrl(query: string, language: string): string {
  const encodedQuery = encodeURIComponent(query + " when:1d");
  if (language === "pt-BR") {
    return `https://news.google.com/rss/search?q=${encodedQuery}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
  }
  return `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;
}

export async function fetchNewsForThemes(themes: Theme[]): Promise<RawArticle[]> {
  const allArticles: RawArticle[] = [];

  const fetchPromises: Promise<void>[] = [];

  for (const theme of themes) {
    // Fetch from Google News RSS for each search query
    for (const query of theme.search_queries) {
      const url = buildGoogleNewsUrl(query, theme.language);
      fetchPromises.push(
        parseRSSFeed(url).then((articles) => {
          for (const article of articles) {
            allArticles.push({
              title: article.title,
              link: article.link,
              source: article.source,
              pubDate: article.pubDate,
              description: article.description,
              themeId: theme.id,
              themeName: theme.name,
            });
          }
        })
      );
    }

    // Fetch from custom RSS feeds if configured
    if (theme.rss_feeds) {
      for (const feedUrl of theme.rss_feeds) {
        fetchPromises.push(
          parseRSSFeed(feedUrl).then((articles) => {
            for (const article of articles) {
              allArticles.push({
                title: article.title,
                link: article.link,
                source: article.source,
                pubDate: article.pubDate,
                description: article.description,
                themeId: theme.id,
                themeName: theme.name,
              });
            }
          })
        );
      }
    }
  }

  await Promise.all(fetchPromises);
  return allArticles;
}
