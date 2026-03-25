"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    themes: 0,
    subscribers: 0,
    newsletters: 0,
    lastSent: null as string | null,
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function loadStats() {
      const [themesRes, subsRes, nlRes] = await Promise.all([
        fetch("/api/admin/themes"),
        fetch("/api/admin/subscribers"),
        fetch("/api/admin/newsletters"),
      ]);
      const themes = await themesRes.json();
      const subs = await subsRes.json();
      const newsletters = await nlRes.json();

      setStats({
        themes: Array.isArray(themes) ? themes.filter((t: { is_active: boolean }) => t.is_active).length : 0,
        subscribers: Array.isArray(subs) ? subs.filter((s: { is_active: boolean }) => s.is_active).length : 0,
        newsletters: Array.isArray(newsletters) ? newsletters.length : 0,
        lastSent: Array.isArray(newsletters) && newsletters[0]?.sent_at
          ? new Date(newsletters[0].sent_at).toLocaleDateString()
          : null,
      });
    }
    loadStats();
  }, []);

  async function handleSendTest() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-test", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Newsletter sent to ${data.sent} subscribers!`);
      } else if (data.skipped) {
        toast.info(data.reason);
      } else {
        toast.error(data.error || "Failed to send");
      }
    } catch {
      toast.error("Failed to send test newsletter");
    }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleSendTest} disabled={sending}>
          {sending ? "Generating..." : "Send Newsletter Now"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active Themes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.themes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Subscribers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.subscribers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Newsletters Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.newsletters}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Last Sent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.lastSent || "Never"}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
