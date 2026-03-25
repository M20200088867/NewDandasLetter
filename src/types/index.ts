export interface Theme {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description: string | null;
  language: "en" | "pt-BR";
  search_queries: string[];
  rss_feeds: string[] | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  children?: Theme[];
}

export interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  is_active: boolean;
  unsubscribe_token: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

export interface Newsletter {
  id: string;
  subject: string;
  intro_text: string;
  language: string;
  html_content: string;
  status: "draft" | "sending" | "sent" | "failed";
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
}

export interface NewsletterItem {
  id: string;
  newsletter_id: string;
  theme_id: string | null;
  original_title: string;
  original_url: string;
  source_name: string | null;
  image_url: string | null;
  ai_summary: string;
  ai_headline: string | null;
  published_at: string | null;
  sort_order: number;
  created_at: string;
}

export interface SendLog {
  id: string;
  newsletter_id: string;
  subscriber_id: string;
  status: "pending" | "sent" | "failed";
  resend_id: string | null;
  sent_at: string | null;
  error_message: string | null;
}

export interface RawArticle {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  description: string;
  themeId: string;
  themeName: string;
}
