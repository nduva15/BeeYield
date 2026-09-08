import { useMemo, useState } from "react";
import { Search, X, PanelLeftClose } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import beeyieldLogo from "@/assets/beeyield-logo.png";

export type ToolItem = { label: string; icon: LucideIcon; onClick: () => void };
export type ToolGroup = { label: string; items: ToolItem[] };

/**
 * Permanent vertical tool rail. Every tool is its own full-width horizontal row
 * so nothing is buried inside a dropdown. On narrow screens it slides over the
 * chat as a drawer; on desktop it is always visible.
 */
export default function ToolSidebar({
  groups,
  open,
  onClose,
}: {
  groups: ToolGroup[];
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, items: g.items.filter((i) => i.label.toLowerCase().includes(q)) }))
      .filter((g) => g.items.length > 0);
  }, [groups, query]);

  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);

  return (
    <>
      {open && (
        <button
          aria-label="Close tools"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r border-border bg-sidebar flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full lg:hidden"
        }`}
      >
        <div className="flex items-center gap-2 px-3 py-3 border-b border-border">
          <img src={beeyieldLogo} alt="Beeyield" className="h-7 w-auto" />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-honey leading-tight">Beeyield tools</p>
            <p className="text-[10px] text-muted-foreground">{total} tools</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Hide tools"
            className="ml-auto p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <span className="lg:hidden"><X className="w-4 h-4" /></span>
            <span className="hidden lg:inline"><PanelLeftClose className="w-4 h-4" /></span>
          </button>
        </div>

        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search tools"
              aria-label="Search tools"
              className="w-full bg-background border border-border rounded-lg pl-8 pr-2 py-1.5 text-xs outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scroll px-2 py-2 space-y-4">
          {filtered.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">No tool matches “{query}”.</p>
          )}
          {filtered.map((g) => (
            <div key={g.label}>
              <p className="px-2 mb-1 text-[10px] uppercase tracking-wide text-honey/80">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.onClick(); onClose(); }}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0 text-honey/80" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
