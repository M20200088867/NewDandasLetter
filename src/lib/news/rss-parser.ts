import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "NewDandasLetter/1.0",
  },
});

export interface ParsedArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
}

export async function parseRSSFeed(url: string): Promise<ParsedArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    return (feed.items || []).map((item) => ({
      title: item.title || "",
      link: item.link || "",
      source: item.creator || feed.title || "",
      pubDate: item.pubDate || item.isoDate || "",
      description: item.contentSnippet || item.content || "",
    }));
  } catch (error) {
    console.error(`Failed to parse RSS feed: ${url}`, error);
    return [];
  }
}
