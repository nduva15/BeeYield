import { useState } from "react";
import { useNativeHive } from "@/hooks/useNativeHive";
import type { BatchVerification } from "@/services/tauri-bridge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, XCircle, Search } from "lucide-react";

export default function ChainVerifier() {
  const hive = useNativeHive();
  const [batchCode, setBatchCode] = useState("");
  const [verification, setVerification] = useState<BatchVerification | null>(
    null
  );

  const handleVerify = async () => {
    if (!batchCode.trim()) return;
    const result = await hive.verifyBatch(batchCode.trim());
    if (result) setVerification(result);
  };

  if (!hive.isTauri) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          HoneyChain Batch Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input
            placeholder="Enter batch code (e.g. KBZ-2026-0142)"
            value={batchCode}
            onChange={(e) => setBatchCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            className="flex-1"
          />
          <Button
            onClick={handleVerify}
            disabled={hive.loading || !batchCode.trim()}
          >
            <Search className="h-4 w-4 mr-1" />
            {hive.loading ? "Verifying…" : "Verify"}
          </Button>
        </div>

        {hive.error && (
          <p className="text-sm text-destructive">{hive.error}</p>
        )}

        {verification && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">
                Batch: {verification.batch_code}
              </h3>
              {verification.is_valid ? (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" /> VERIFIED
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" /> FAILED
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Merkle Root</span>
                <p className="font-mono text-xs truncate">
                  {verification.merkle_root}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Block Index</span>
                <p className="font-medium">{verification.block_index}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Integrity Score</span>
                <p className="font-medium">
                  {(verification.integrity_score * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Chain Length</span>
                <p className="font-medium">{verification.chain_length}</p>
              </div>
            </div>

            {verification.details && (
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground">
                  Raw verification details
                </summary>
                <pre className="mt-2 bg-muted p-2 rounded overflow-x-auto">
                  {JSON.stringify(verification.details, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
