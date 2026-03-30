import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
}

export default function MessageActions({ content }: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
      <button
        onClick={handleCopy}
        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        title="Copy message"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}
