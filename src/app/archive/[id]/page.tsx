import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function NewsletterViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: newsletter } = await supabase
    .from("newsletters")
    .select("*")
    .eq("id", id)
    .eq("status", "sent")
    .single();

  if (!newsletter) notFound();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
          <Link href="/archive" className="text-sm text-indigo-600 hover:underline">
            &larr; Back to archive
          </Link>
          <span className="text-sm text-muted-foreground">
            {newsletter.sent_at
              ? new Date(newsletter.sent_at).toLocaleDateString()
              : "Draft"}
          </span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto py-8 px-4">
        <div
          className="bg-white rounded-lg shadow-sm overflow-hidden"
          dangerouslySetInnerHTML={{ __html: newsletter.html_content }}
        />
      </main>
    </div>
  );
}
