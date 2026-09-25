import { useMemo, useState, startTransition } from "react";
import { Search, X, PanelLeftClose } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import beeyieldLogo from "@/assets/beeyield-logo.png";
import { cn } from "@/lib/utils";

export type ToolItem = { label: string; icon: LucideIcon; onClick: () => void; id?: string };
export type ToolGroup = { label: string; items: ToolItem[] };

/**
 * Permanent vertical tool rail. Every tool is its own full-width horizontal row
 * so nothing is buried inside a dropdown. On narrow screens it slides over as a drawer;
 * on desktop it sticks cleanly as a permanent vertical rail that remains active while working.
 */
export default function ToolSidebar({
  groups,
  open,
  onClose,
  activeTab,
}: {
  groups: ToolGroup[];
  open: boolean;
  onClose: () => void;
  activeTab?: string;
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
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-40 w-72 flex-shrink-0 border-r border-border bg-sidebar flex flex-col transition-transform duration-200 select-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex items-center gap-2.5 px-3.5 py-3 border-b border-border">
          <img src="/favicon.svg" alt="BeeYield Logo" className="h-7 w-7 object-contain rounded-full shadow-xs shrink-0" onError={(e) => { (e.target as HTMLImageElement).src = "/favicon-192.png"; }} />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-[#f59e0b] leading-tight">BeeYield Dashboard</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="ml-auto p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors lg:hidden"
          >
            <X className="w-4 h-4" />
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
              className="w-full bg-background border border-border rounded-lg pl-8 pr-2 py-1.5 text-xs outline-none focus:border-amber-500/60 text-foreground"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2 space-y-4">
          {filtered.length === 0 && (
            <p className="px-2 text-xs text-muted-foreground">No tool matches “{query}”.</p>
          )}
          {filtered.map((g) => (
            <div key={g.label}>
              <p className="px-2 mb-1 text-[10px] uppercase font-bold tracking-wider text-[#f59e0b]">{g.label}</p>
              <div className="space-y-0.5">
                {g.items.map((item) => {
                  const isActive = Boolean(
                    activeTab && (
                      item.id === activeTab ||
                      ((activeTab === 'beeyield' || activeTab === 'hives') && (item.id === 'beeyield' || item.id === 'hives'))
                    )
                  );
                  const handleItemClick = () => {
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      onClose();
                    }
                    // Yield immediately to the browser event loop to paint interaction before dispatching heavy view switch
                    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
                      window.requestAnimationFrame(() => {
                        startTransition(() => {
                          item.onClick();
                        });
                      });
                    } else {
                      startTransition(() => {
                        item.onClick();
                      });
                    }
                  };

                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={handleItemClick}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer",
                        isActive
                          ? "bg-amber-500/15 border border-amber-500/30 text-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <item.icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-[#f59e0b]" : "text-[#f59e0b]/80")} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
