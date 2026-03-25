import { createAdminClient } from "@/lib/supabase/admin";
import { fetchNewsForThemes } from "@/lib/news/fetcher";
import { deduplicateArticles } from "@/lib/news/deduplicator";
import { rankArticles } from "@/lib/ai/ranker";
import { summarizeArticles } from "@/lib/ai/summarizer";
import { writeNewsletterIntro } from "@/lib/ai/intro-writer";
import { renderNewsletterHtml, renderArchiveHtml } from "@/lib/email/templates/newsletter";
import { sendEmail } from "@/lib/email/sender";
import type { Theme } from "@/types";

export async function generateAndSendNewsletter() {
  const supabase = createAdminClient();
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
    : "http://localhost:3000";

  console.log("[Pipeline] Starting newsletter generation...");

  // Step 1: Fetch active themes (leaf nodes with search queries)
  const { data: themes, error: themesError } = await supabase
    .from("themes")
    .select("*")
    .eq("is_active", true);

  if (themesError) throw new Error(`Failed to fetch themes: ${themesError.message}`);
  if (!themes || themes.length === 0) {
    console.log("[Pipeline] No active themes found. Skipping.");
    return { skipped: true, reason: "No active themes" };
  }

  const activeThemes = themes as Theme[];
  const themeNames = [...new Set(activeThemes.map((t) => t.name))];

  // Determine primary language (majority wins)
  const langCounts = activeThemes.reduce(
    (acc, t) => {
      acc[t.language] = (acc[t.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
  const primaryLanguage = (Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "en") as "en" | "pt-BR";

  console.log(`[Pipeline] Found ${activeThemes.length} themes. Language: ${primaryLanguage}`);

  // Step 2: Fetch news
  console.log("[Pipeline] Fetching news from RSS feeds...");
  const rawArticles = await fetchNewsForThemes(activeThemes);
  console.log(`[Pipeline] Fetched ${rawArticles.length} raw articles`);

  if (rawArticles.length === 0) {
    console.log("[Pipeline] No articles found. Skipping.");
    return { skipped: true, reason: "No articles found" };
  }

  // Step 3: Deduplicate
  const unique = deduplicateArticles(rawArticles);
  console.log(`[Pipeline] ${unique.length} unique articles after dedup`);

  // Step 4: Rank
  console.log("[Pipeline] Ranking articles with AI...");
  const topIndices = await rankArticles(unique, themeNames, 10);
  const topArticles = topIndices.map((i) => unique[i]);
  console.log(`[Pipeline] Selected top ${topArticles.length} articles`);

  // Step 5: Summarize
  console.log("[Pipeline] Summarizing articles with AI...");
  const summaries = await summarizeArticles(topArticles, primaryLanguage);

  // Step 6: Write intro
  const topHeadline = summaries[0]?.headline || topArticles[0]?.title || "Today's News";
  console.log("[Pipeline] Writing newsletter intro...");
  const intro = await writeNewsletterIntro(topHeadline, themeNames, primaryLanguage);

  // Step 7: Build newsletter data
  const today = new Date().toLocaleDateString(primaryLanguage === "pt-BR" ? "pt-BR" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const articleData = topArticles.map((article, i) => {
    const summary = summaries.find((s) => s.index === i);
    return {
      headline: summary?.headline || article.title,
      summary: summary?.summary || article.description,
      source: article.source,
      url: article.link,
      themeName: article.themeName,
    };
  });

  // Render archive version (no personalized unsubscribe)
  const archiveHtml = renderArchiveHtml({
    intro,
    articles: articleData,
    date: today,
  });

  const subject = `NewDandasLetter — ${today}`;

  // Save newsletter to DB
  const { data: newsletter, error: nlError } = await supabase
    .from("newsletters")
    .insert({
      subject,
      intro_text: intro,
      language: primaryLanguage,
      html_content: archiveHtml,
      status: "sending",
    })
    .select()
    .single();

  if (nlError) throw new Error(`Failed to save newsletter: ${nlError.message}`);

  // Save newsletter items
  const items = topArticles.map((article, i) => {
    const summary = summaries.find((s) => s.index === i);
    return {
      newsletter_id: newsletter.id,
      theme_id: article.themeId,
      original_title: article.title,
      original_url: article.link,
      source_name: article.source,
      ai_summary: summary?.summary || article.description,
      ai_headline: summary?.headline || article.title,
      published_at: article.pubDate || null,
      sort_order: i,
    };
  });

  await supabase.from("newsletter_items").insert(items);

  // Step 8: Send emails
  console.log("[Pipeline] Sending emails...");
  const { data: subscribers } = await supabase
    .from("subscribers")
    .select("*")
    .eq("is_active", true);

  if (!subscribers || subscribers.length === 0) {
    await supabase
      .from("newsletters")
      .update({ status: "sent", sent_at: new Date().toISOString(), recipient_count: 0 })
      .eq("id", newsletter.id);
    console.log("[Pipeline] No active subscribers. Newsletter saved but not sent.");
    return { sent: 0, newsletterId: newsletter.id };
  }

  let sentCount = 0;
  let failCount = 0;

  for (const subscriber of subscribers) {
    const unsubscribeUrl = `${baseUrl}/unsubscribe?token=${subscriber.unsubscribe_token}`;
    const personalizedHtml = renderNewsletterHtml({
      intro,
      articles: articleData,
      date: today,
      unsubscribeUrl,
    });

    try {
      const result = await sendEmail({
        to: subscriber.email,
        subject,
        html: personalizedHtml,
      });

      await supabase.from("send_log").insert({
        newsletter_id: newsletter.id,
        subscriber_id: subscriber.id,
        status: "sent",
        resend_id: result?.id || null,
        sent_at: new Date().toISOString(),
      });
      sentCount++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      await supabase.from("send_log").insert({
        newsletter_id: newsletter.id,
        subscriber_id: subscriber.id,
        status: "failed",
        error_message: message,
      });
      failCount++;
    }
  }

  // Update newsletter status
  await supabase
    .from("newsletters")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      recipient_count: sentCount,
    })
    .eq("id", newsletter.id);

  console.log(`[Pipeline] Done! Sent: ${sentCount}, Failed: ${failCount}`);
  return { sent: sentCount, failed: failCount, newsletterId: newsletter.id };
}
