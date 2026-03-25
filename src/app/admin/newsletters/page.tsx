"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NewsletterSummary {
  id: string;
  subject: string;
  status: string;
  sent_at: string | null;
  recipient_count: number;
  created_at: string;
  language: string;
}

export default function NewslettersPage() {
  const [newsletters, setNewsletters] = useState<NewsletterSummary[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/newsletters");
    const data = await res.json();
    if (Array.isArray(data)) setNewsletters(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  function statusColor(status: string) {
    switch (status) {
      case "sent": return "default" as const;
      case "sending": return "secondary" as const;
      case "failed": return "destructive" as const;
      default: return "outline" as const;
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Newsletters</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Past Newsletters</CardTitle>
        </CardHeader>
        <CardContent>
          {newsletters.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No newsletters generated yet. Use the &quot;Send Newsletter Now&quot; button on the dashboard.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((nl) => (
                  <TableRow key={nl.id}>
                    <TableCell>
                      <Link
                        href={`/archive/${nl.id}`}
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        {nl.subject}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColor(nl.status)}>{nl.status}</Badge>
                    </TableCell>
                    <TableCell>{nl.language}</TableCell>
                    <TableCell>{nl.recipient_count}</TableCell>
                    <TableCell>
                      {nl.sent_at
                        ? new Date(nl.sent_at).toLocaleString()
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
