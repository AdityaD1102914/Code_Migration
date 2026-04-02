import { useState } from "react";
import { Code2, Copy, Download, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/LegacyLift/components/ui/card";
import { Button } from "@/LegacyLift/components/ui/button";
import { ConvertedCodeProps } from "@/LegacyLift/types/analysis";



export const ConvertedCode = ({ code, onDownload }: ConvertedCodeProps) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="shadow-card-hover border-2 transition-smooth animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-2xl">Converted React Code</CardTitle>
              <CardDescription className="text-white/80 mt-1">
                Modern, optimized React components
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={copyToClipboard}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button
              onClick={onDownload}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="bg-slate-900 rounded-xl p-6 max-h-[500px] overflow-auto border border-slate-700 shadow-inner">
          <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
            {code}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
