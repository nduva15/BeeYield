import { useState, useEffect } from "react";
import { useNativeHive } from "@/hooks/useNativeHive";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StreamingSearch } from "@/components/native-hive/StreamingSearch";
import {
  Activity,
  Brain,
  Database,
  HardDrive,
  Search,
  Shield,
  Zap,
} from "lucide-react";

export default function NativeHiveDashboard() {
  const hive = useNativeHive();
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [stats, setStats] = useState<{
    total_nodes: number;
    dimensions: number;
    memory_usage_mb: number;
    categories: [string, number][];
  } | null>(null);
  const [systemInfo, setSystemInfo] = useState<Record<string, unknown> | null>(
    null
  );

  // Load stats on mount (only in Tauri)
  useEffect(() => {
    if (!hive.isTauri) return;
    hive.getStoreStats().then((s) => s && setStats(s));
    hive.getSystemInfo().then((i) => i && setSystemInfo(i as any));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAsk = async () => {
    if (!query.trim()) return;
    const resp = await hive.askBeeYield({
      question: query,
      context_limit: 15,
      include_sources: true,
    });
    if (resp) {
      setAnswer(resp.answer);
    }
  };

  if (!hive.isTauri) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Native Hive — Desktop Only
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The Native Hive dashboard requires the BeeYield desktop app
              (Tauri). Download it to unlock Rust-powered vector search across
              25,000+ datasets with zero lag.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-8 w-8 text-amber-500" />
            Native Hive Engine
          </h1>
          <p className="text-muted-foreground mt-1">
            Rust-powered AI — 25,000+ nodes, &lt;100ms search
          </p>
        </div>
        <Badge
          variant="outline"
          className="border-green-500 text-green-600 text-sm"
        >
          <Activity className="h-3 w-3 mr-1" /> Engine Online
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Database className="h-4 w-4" /> Knowledge Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.total_nodes?.toLocaleString() ?? "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Zap className="h-4 w-4" /> Dimensions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.dimensions ?? "—"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <HardDrive className="h-4 w-4" /> Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {stats?.memory_usage_mb != null
                ? `${stats.memory_usage_mb} MB`
                : "—"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Shield className="h-4 w-4" /> Engine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {(systemInfo as any)?.version ?? "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              Rust {(systemInfo as any)?.rust_version ?? ""} /{" "}
              {(systemInfo as any)?.os ?? ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Query */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ask BeeYield AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask anything about your hives, harvests, or honey traceability…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
          />
          <Button
            onClick={handleAsk}
            disabled={hive.loading || !query.trim()}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {hive.loading ? "Thinking…" : "Ask (Gemini + GPT-4o)"}
          </Button>

          {hive.error && (
            <p className="text-sm text-destructive">{hive.error}</p>
          )}

          {answer && (
            <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {answer}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streaming Vector Search */}
      <Card>
        <CardContent className="pt-6">
          <StreamingSearch />
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {stats?.categories && stats.categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Knowledge Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {stats.categories.map(([name, count]) => (
                <Badge key={name} variant="secondary">
                  {name}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
