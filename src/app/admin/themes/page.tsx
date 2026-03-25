"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Theme } from "@/types";
import { buildThemeTree } from "@/lib/utils/themes";

interface ThemeForm {
  name: string;
  parent_id: string | null;
  description: string;
  language: "en" | "pt-BR";
  search_queries: string;
  rss_feeds: string;
  is_active: boolean;
}

const emptyForm: ThemeForm = {
  name: "",
  parent_id: null,
  description: "",
  language: "en",
  search_queries: "",
  rss_feeds: "",
  is_active: true,
};

function ThemeNode({
  theme,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: {
  theme: Theme;
  depth: number;
  onEdit: (t: Theme) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}) {
  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-50 group"
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
      >
        <span className="font-medium flex-1">{theme.name}</span>
        <Badge variant={theme.is_active ? "default" : "secondary"} className="text-xs">
          {theme.language}
        </Badge>
        {!theme.is_active && (
          <Badge variant="outline" className="text-xs">inactive</Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition">
          <Button variant="ghost" size="sm" onClick={() => onAddChild(theme.id)}>
            + Child
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onEdit(theme)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(theme.id)}>
            Delete
          </Button>
        </div>
      </div>
      {theme.children?.map((child) => (
        <ThemeNode
          key={child.id}
          theme={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </div>
  );
}

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ThemeForm>(emptyForm);

  const loadThemes = useCallback(async () => {
    const res = await fetch("/api/admin/themes");
    const data = await res.json();
    if (Array.isArray(data)) setThemes(data);
  }, []);

  useEffect(() => { loadThemes(); }, [loadThemes]);

  const tree = buildThemeTree(themes);

  function openCreate(parentId: string | null = null) {
    setEditingId(null);
    setForm({ ...emptyForm, parent_id: parentId });
    setDialogOpen(true);
  }

  function openEdit(theme: Theme) {
    setEditingId(theme.id);
    setForm({
      name: theme.name,
      parent_id: theme.parent_id,
      description: theme.description || "",
      language: theme.language as "en" | "pt-BR",
      search_queries: theme.search_queries.join(", "),
      rss_feeds: theme.rss_feeds?.join(", ") || "",
      is_active: theme.is_active,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    const payload = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      parent_id: form.parent_id || null,
      description: form.description || null,
      language: form.language,
      search_queries: form.search_queries.split(",").map((s) => s.trim()).filter(Boolean),
      rss_feeds: form.rss_feeds ? form.rss_feeds.split(",").map((s) => s.trim()).filter(Boolean) : null,
      is_active: form.is_active,
    };

    const res = await fetch("/api/admin/themes", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(editingId ? "Theme updated" : "Theme created");
      setDialogOpen(false);
      loadThemes();
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to save");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this theme and all its children?")) return;
    const res = await fetch(`/api/admin/themes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Theme deleted");
      loadThemes();
    } else {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Themes</h1>
        <Button onClick={() => openCreate()}>Add Root Theme</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {tree.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No themes yet. Add your first root theme to get started.
            </p>
          ) : (
            tree.map((theme) => (
              <ThemeNode
                key={theme.id}
                theme={theme}
                depth={0}
                onEdit={openEdit}
                onDelete={handleDelete}
                onAddChild={(parentId) => openCreate(parentId)}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Theme" : "Add Theme"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Artificial Intelligence"
              />
            </div>
            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this theme"
              />
            </div>
            <div className="space-y-2">
              <Label>Language</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value as "en" | "pt-BR" })}
              >
                <option value="en">English</option>
                <option value="pt-BR">Portuguese (BR)</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Search Queries (comma-separated)</Label>
              <Input
                value={form.search_queries}
                onChange={(e) => setForm({ ...form, search_queries: e.target.value })}
                placeholder="e.g., AI startups, artificial intelligence companies"
              />
              <p className="text-xs text-muted-foreground">
                These keywords are used to search Google News RSS. Be specific for better results.
              </p>
            </div>
            <div className="space-y-2">
              <Label>Custom RSS Feeds (optional, comma-separated URLs)</Label>
              <Input
                value={form.rss_feeds}
                onChange={(e) => setForm({ ...form, rss_feeds: e.target.value })}
                placeholder="e.g., https://techcrunch.com/feed/"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingId ? "Update" : "Create"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
