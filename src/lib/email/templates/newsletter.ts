interface NewsletterArticle {
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl?: string;
  themeName: string;
}

interface NewsletterEmailProps {
  intro: string;
  articles: NewsletterArticle[];
  date: string;
  unsubscribeUrl: string;
}

export function renderNewsletterHtml({
  intro,
  articles,
  date,
  unsubscribeUrl,
}: NewsletterEmailProps): string {
  const topArticle = articles[0];
  const restArticles = articles.slice(1);

  // Group remaining articles by theme
  const grouped = new Map<string, NewsletterArticle[]>();
  for (const article of restArticles) {
    const existing = grouped.get(article.themeName) || [];
    existing.push(article);
    grouped.set(article.themeName, existing);
  }

  const categoryBlocks = Array.from(grouped.entries())
    .map(
      ([theme, arts]) => `
      <tr>
        <td style="padding: 0 32px 24px;">
          <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #6b7280; margin: 0 0 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">${theme}</h2>
          ${arts
            .map(
              (a) => `
            <div style="margin-bottom: 20px;">
              <a href="${a.url}" style="font-size: 18px; font-weight: 600; color: #111827; text-decoration: none; line-height: 1.3;">${a.headline}</a>
              <p style="font-size: 15px; color: #4b5563; margin: 6px 0 4px; line-height: 1.5;">${a.summary}</p>
              <p style="font-size: 13px; color: #9ca3af; margin: 0;">${a.source} · <a href="${a.url}" style="color: #2563eb; text-decoration: none;">Read more →</a></p>
            </div>`
            )
            .join("")}
        </td>
      </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NewDandasLetter - ${date}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e1b4b, #312e81); padding: 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">NewDandasLetter</h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #c7d2fe;">${date}</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0;">${intro}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>

          <!-- Top Story -->
          ${
            topArticle
              ? `
          <tr>
            <td style="padding: 24px 32px;">
              <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 2px; color: #dc2626; font-weight: 700; margin: 0 0 12px;">Top Story</p>
              ${
                topArticle.imageUrl
                  ? `<img src="${topArticle.imageUrl}" alt="" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 16px;">`
                  : ""
              }
              <a href="${topArticle.url}" style="font-size: 22px; font-weight: 700; color: #111827; text-decoration: none; line-height: 1.3;">${topArticle.headline}</a>
              <p style="font-size: 16px; color: #4b5563; margin: 10px 0 6px; line-height: 1.6;">${topArticle.summary}</p>
              <p style="font-size: 13px; color: #9ca3af; margin: 0;">${topArticle.source} · <a href="${topArticle.url}" style="color: #2563eb; text-decoration: none;">Read full article →</a></p>
            </td>
          </tr>

          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 0;">
            </td>
          </tr>`
              : ""
          }

          <!-- Category Blocks -->
          <tr><td style="padding-top: 24px;"></td></tr>
          ${categoryBlocks}

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 13px; color: #9ca3af; margin: 0;">
                You're receiving this because you subscribed to NewDandasLetter.
              </p>
              <p style="font-size: 13px; margin: 8px 0 0;">
                <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Render a generic version for the archive (no personalized unsubscribe link) */
export function renderArchiveHtml(props: Omit<NewsletterEmailProps, "unsubscribeUrl">): string {
  return renderNewsletterHtml({ ...props, unsubscribeUrl: "#" });
}
