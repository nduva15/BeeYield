import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus, StickyNote, Ghost, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Helmet } from "react-helmet";

interface Note {
    id: number;
    title: string;
    created_at?: string;
}

const Notes = () => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchNotes = async () => {
        if (!supabase) return;
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("notes")
                .select("*")
                .order("id", { ascending: true });

            if (error) throw error;
            setNotes(data || []);
        } catch (error) {
            console.error("Failed to fetch notes:", error);
            toast.error("Could not load notes.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNote.trim() || !supabase) return;

        try {
            setSubmitting(true);
            const { error } = await supabase
                .from("notes" as any)
                .insert([{ title: newNote.trim() }]);

            if (error) throw error;

            toast.success("Note added successfully!");
            setNewNote("");
            fetchNotes();
        } catch (error) {
            console.error("Failed to add note:", error);
            toast.error("Could not add note.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteNote = async (id: number) => {
        if (!supabase) return;
        try {
            const { error } = await supabase
                .from("notes")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Note deleted");
            fetchNotes();
        } catch (error) {
            console.error("Failed to delete note:", error);
            toast.error("Could not delete note.");
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Notes | BeeYield</title>
                <meta name="description" content="Manage your BeeYield project notes and tasks." />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center animate-fade-in">
                    <div className="inline-flex items-center justify-center p-3 mb-6 rounded-3xl bg-primary/10 text-primary animate-float">
                        <StickyNote size={32} />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black tracking-tightest mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-honey-dark">
                        BeeYield Notes
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Stay organized and keep track of your honey production and pollination insights.
                    </p>
                </div>

                {/* Add Note Section */}
                <Card className="mb-12 border-none shadow-premium bg-white/50 dark:bg-black/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden animate-slide-in-top">
                    <CardContent className="p-8">
                        <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-4">
                            <div className="relative flex-grow">
                                <Input
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Enter a new note..."
                                    className="h-14 bg-white dark:bg-white/5 border-none rounded-2xl px-6 text-lg focus-visible:ring-primary/20 shadow-soft"
                                    disabled={submitting}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting || !newNote.trim()}
                                className="h-14 sm:w-40 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-lg shadow-glow-primary transition-all duration-300 active:scale-95"
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin mr-2" />
                                ) : (
                                    <>
                                        <Plus className="mr-2" size={20} />
                                        Add Note
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Notes Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground font-medium">Fetching your notes...</p>
                    </div>
                ) : notes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
                        {notes.map((note, index) => (
                            <div
                                key={note.id}
                                className="group p-6 rounded-[2rem] bg-white dark:bg-white/5 border border-white/20 shadow-soft hover:shadow-premium transition-all duration-500 hover:-translate-y-1 animate-slide-in-bottom relative"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="flex items-start gap-4 pr-8">
                                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                        <span className="font-bold">{note.id}</span>
                                    </div>
                                    <p className="text-lg font-medium leading-tight pt-1">
                                        {note.title}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className="absolute top-6 right-6 p-2 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                                    title="Delete note"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/30 dark:bg-white/5 rounded-[3rem] border border-dashed border-muted active:scale-[0.99] transition-all animate-fade-in">
                        <div className="inline-flex items-center justify-center p-6 mb-6 rounded-full bg-muted/20 text-muted">
                            <Ghost size={48} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">No notes found</h3>
                        <p className="text-muted-foreground max-w-xs mx-auto mb-8">
                            You haven't added any notes yet. Start by typing something in the box above!
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;

