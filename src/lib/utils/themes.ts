import type { Theme } from "@/types";

/** Build a tree from a flat list of themes */
export function buildThemeTree(themes: Theme[]): Theme[] {
  const map = new Map<string, Theme>();
  const roots: Theme[] = [];

  for (const theme of themes) {
    map.set(theme.id, { ...theme, children: [] });
  }

  for (const theme of map.values()) {
    if (theme.parent_id && map.has(theme.parent_id)) {
      map.get(theme.parent_id)!.children!.push(theme);
    } else {
      roots.push(theme);
    }
  }

  // Sort children by sort_order
  const sortChildren = (nodes: Theme[]) => {
    nodes.sort((a, b) => a.sort_order - b.sort_order);
    for (const node of nodes) {
      if (node.children?.length) sortChildren(node.children);
    }
  };
  sortChildren(roots);

  return roots;
}

/** Generate a slug from a name */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Get the full path of a theme (e.g., "Technology > AI > Startups") */
export function getThemePath(theme: Theme, allThemes: Theme[]): string {
  const path: string[] = [theme.name];
  let current = theme;

  while (current.parent_id) {
    const parent = allThemes.find((t) => t.id === current.parent_id);
    if (!parent) break;
    path.unshift(parent.name);
    current = parent;
  }

  return path.join(" > ");
}
