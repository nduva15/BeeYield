import { useState } from "react";
import { MessageSquare, Trash2, Plus, Pencil, Check, X, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export type Conversation = {
  id: string;
  title: string;
  updated_at: string;
};

interface ChatHistoryProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatHistory({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onRename,
  isOpen,
  onClose,
}: ChatHistoryProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);

  if (!isOpen) return null;

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (e: React.MouseEvent, c: Conversation) => {
    e.stopPropagation();
    setDeleteConfirm({ id: c.id, title: c.title });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  const startEdit = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const confirmEdit = () => {
    if (editingId && editTitle.trim()) {
      onRename(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex">
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />

        <div className="relative w-72 max-w-[80vw] h-full bg-card border-r border-border flex flex-col shadow-lg animate-fade-in">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-display font-bold text-foreground text-sm">Chat History</h2>
            <button
              onClick={onNew}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
            >
              <Plus className="w-3 h-3" />
              New
            </button>
          </div>

          <div className="px-3 py-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-muted border-border"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scroll p-2 space-y-1">
            {filteredConversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                {searchQuery ? "No matching conversations" : "No conversations yet"}
              </p>
            )}
            {filteredConversations.map((c) => (
              <div
                key={c.id}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all text-sm ${
                  c.id === activeId
                    ? "bg-primary/10 text-foreground border border-primary/30"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => {
                  if (editingId !== c.id) {
                    onSelect(c.id);
                    onClose();
                  }
                }}
              >
                <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />

                {editingId === c.id ? (
                  <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") confirmEdit();
                        if (e.key === "Escape") cancelEdit();
                      }}
                      className="flex-1 text-xs bg-muted border border-border rounded px-1.5 py-0.5 outline-none focus:border-primary/50 text-foreground"
                      autoFocus
                    />
                    <button onClick={confirmEdit} className="text-primary hover:text-primary/80 p-0.5" title="Save">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={cancelEdit} className="text-muted-foreground hover:text-foreground p-0.5" title="Cancel">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-xs">{c.title}</span>
                      <span className="block text-[10px] text-muted-foreground/60">{formatDate(c.updated_at)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(c); }}
                        className="text-muted-foreground hover:text-foreground p-0.5"
                        title="Rename"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, c)}
                        className="text-muted-foreground hover:text-destructive p-0.5"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{deleteConfirm?.title}" and all its messages. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
