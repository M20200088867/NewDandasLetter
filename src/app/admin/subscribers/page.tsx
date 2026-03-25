"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Subscriber } from "@/types";

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/subscribers");
    const data = await res.json();
    if (Array.isArray(data)) setSubscribers(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Remove subscriber ${email}?`)) return;
    const res = await fetch(`/api/admin/subscribers?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Subscriber removed");
      load();
    } else {
      toast.error("Failed to remove");
    }
  }

  const active = subscribers.filter((s) => s.is_active);
  const inactive = subscribers.filter((s) => !s.is_active);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Subscribers</h1>
        <Badge variant="secondary">{active.length} active</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Subscribers</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No subscribers yet. Share your subscribe link!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.email}</TableCell>
                    <TableCell>{sub.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={sub.is_active ? "default" : "secondary"}>
                        {sub.is_active ? "Active" : "Unsubscribed"}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(sub.subscribed_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDelete(sub.id, sub.email)}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {inactive.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {inactive.length} unsubscribed
        </p>
      )}
    </div>
  );
}
