import { useState, useCallback } from "react";
import { useNativeHive } from "@/hooks/useNativeHive";
import type { IngestDoc } from "@/services/tauri-bridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const CATEGORIES = [
  "ResearchPaper",
  "HiveData",
  "HarvestRecord",
  "PollinationGuide",
  "MarketIntelligence",
  "RegulatoryCompliance",
  "FarmerKnowledge",
  "WeatherPattern",
  "PestAlert",
  "Custom",
] as const;

interface DocEntry {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
}

export default function VectorIngestion() {
  const hive = useNativeHive();
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [result, setResult] = useState<{
    inserted: number;
    failed: number;
    errors: string[];
  } | null>(null);

  const addDoc = useCallback(() => {
    setDocs((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        title: "",
        content: "",
        source: "",
        category: "FarmerKnowledge",
      },
    ]);
  }, []);

  const removeDoc = useCallback((id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const updateDoc = useCallback(
    (id: string, field: keyof DocEntry, value: string) => {
      setDocs((prev) =>
        prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
      );
    },
    []
  );

  const handleIngest = async () => {
    const payload: IngestDoc[] = docs
      .filter((d) => d.title.trim() && d.content.trim())
      .map((d) => ({
        title: d.title,
        content: d.content,
        source: d.source || undefined,
        category: d.category,
      }));

    if (payload.length === 0) return;

    const res = await hive.ingestDocuments(payload);
    if (res) {
      setResult(res);
      if (res.failed === 0) {
        setDocs([]);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const text = await file.text();
      setDocs((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.[^.]+$/, ""),
          content: text,
          source: `file:${file.name}`,
          category: "Custom",
        },
      ]);
    }
  };

  if (!hive.isTauri) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Ingest Documents into Knowledge Lake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bulk file upload */}
        <div className="flex items-center gap-3">
          <Input
            type="file"
            multiple
            accept=".txt,.md,.csv,.json"
            onChange={handleFileUpload}
            className="max-w-xs"
          />
          <Button variant="outline" size="sm" onClick={addDoc}>
            <Plus className="h-4 w-4 mr-1" /> Add Manual Entry
          </Button>
        </div>

        {/* Document entries */}
        {docs.map((doc, i) => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 space-y-3 bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">Document {i + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeDoc(doc.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <Input
              placeholder="Title"
              value={doc.title}
              onChange={(e) => updateDoc(doc.id, "title", e.target.value)}
            />
            <Textarea
              placeholder="Content (paste research text, hive data, etc.)"
              value={doc.content}
              onChange={(e) => updateDoc(doc.id, "content", e.target.value)}
              rows={4}
            />
            <div className="flex gap-3">
              <Input
                placeholder="Source (URL, file, etc.)"
                value={doc.source}
                onChange={(e) => updateDoc(doc.id, "source", e.target.value)}
                className="flex-1"
              />
              <Select
                value={doc.category}
                onValueChange={(v) => updateDoc(doc.id, "category", v)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        {/* Ingest button */}
        {docs.length > 0 && (
          <Button
            onClick={handleIngest}
            disabled={hive.loading}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {hive.loading
              ? "Embedding & Ingesting…"
              : `Ingest ${docs.length} Document${docs.length > 1 ? "s" : ""}`}
          </Button>
        )}

        {/* Result feedback */}
        {result && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
            {result.failed === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            )}
            <div>
              <p className="font-medium">
                {result.inserted} inserted, {result.failed} failed
              </p>
              {result.errors.length > 0 && (
                <ul className="text-sm text-destructive mt-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {hive.error && (
          <p className="text-sm text-destructive">{hive.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
