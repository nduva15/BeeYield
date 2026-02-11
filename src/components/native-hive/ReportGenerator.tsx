import { useState } from "react";
import { useNativeHive } from "@/hooks/useNativeHive";
import type { ReportRequest, AIResponse } from "@/services/tauri-bridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Clock, Cpu } from "lucide-react";

const REPORT_TYPES = [
  { value: "HiveHealth", label: "Hive Health Assessment" },
  { value: "HarvestSummary", label: "Harvest Summary" },
  { value: "PollinationEfficiency", label: "Pollination Efficiency" },
  { value: "MarketAnalysis", label: "Market Analysis" },
  { value: "TraceabilityAudit", label: "Traceability Audit" },
] as const;

export default function ReportGenerator() {
  const hive = useNativeHive();
  const [reportType, setReportType] = useState<string>("HiveHealth");
  const [report, setReport] = useState<AIResponse | null>(null);

  const handleGenerate = async () => {
    const req: ReportRequest = {
      report_type: reportType as ReportRequest["report_type"],
    };
    const resp = await hive.generateReport(req);
    if (resp) setReport(resp);
  };

  if (!hive.isTauri) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Report Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REPORT_TYPES.map((rt) => (
                <SelectItem key={rt.value} value={rt.value}>
                  {rt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerate}
            disabled={hive.loading}
            className="bg-amber-500 hover:bg-amber-600"
          >
            {hive.loading ? "Generating…" : "Generate Report"}
          </Button>
        </div>

        {hive.error && (
          <p className="text-sm text-destructive">{hive.error}</p>
        )}

        {report && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" /> {report.model_used}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" /> {report.latency_ms}ms
              </span>
              <Badge variant="outline">
                {report.tokens_used.total_tokens} tokens
              </Badge>
            </div>

            <div className="prose prose-sm max-w-none bg-muted p-4 rounded-lg whitespace-pre-wrap">
              {report.answer}
            </div>

            {report.sources.length > 0 && (
              <details className="text-sm">
                <summary className="cursor-pointer text-muted-foreground">
                  {report.sources.length} sources used
                </summary>
                <ul className="mt-2 space-y-1">
                  {report.sources.map((s) => (
                    <li key={s.node_id} className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {(s.score * 100).toFixed(0)}%
                      </Badge>
                      <span>{s.title}</span>
                      <span className="text-muted-foreground">({s.source})</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
