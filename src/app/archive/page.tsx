import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const revalidate = 3600; // Revalidate every hour

export default async function ArchivePage() {
  const supabase = createAdminClient();

  const { data: newsletters } = await supabase
    .from("newsletters")
    .select("id, subject, sent_at, recipient_count, language")
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(50);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-indigo-950 to-indigo-900 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Link href="/" className="text-3xl font-extrabold text-white tracking-tight">
            NewDandasLetter
          </Link>
          <p className="text-indigo-200 mt-2">Newsletter Archive</p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {!newsletters || newsletters.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No newsletters sent yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {newsletters.map((nl) => (
              <Link key={nl.id} href={`/archive/${nl.id}`}>
                <Card className="hover:shadow-md transition cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{nl.subject}</CardTitle>
                      <Badge variant="secondary">{nl.language}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      {nl.sent_at && (
                        <span>
                          {new Date(nl.sent_at).toLocaleDateString()}
                        </span>
                      )}
                      <span>{nl.recipient_count} recipients</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
