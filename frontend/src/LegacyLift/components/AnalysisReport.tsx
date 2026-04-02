import {
  BarChart3,
  Download,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/LegacyLift/components/ui/card";
import { Button } from "@/LegacyLift/components/ui/button";
import { AnalysisReportProps } from "@/LegacyLift/types/analysis";

export const AnalysisReport = ({ report, onDownload }: AnalysisReportProps) => {
  // Parse the report to extract structured sections
  const parseReport = (text: string) => {
    const sections = text.split("\n\n").filter(Boolean);
    return sections;
  };

  const sections = parseReport(report);

  // Extract key metrics from the report
  const extractMetrics = (text: string) => {
    const metrics = [];

    // Look for complexity score
    const complexityMatch = text.match(/complexity score[:\s]+(\d+)/i);
    if (complexityMatch) {
      metrics.push({
        label: "Complexity Score",
        value: complexityMatch[1],
        icon: TrendingUp,
        color: "text-primary",
      });
    }

    // Look for timeline
    const timelineMatch = text.match(/(\d+-\d+)\s+weeks/i);
    if (timelineMatch) {
      metrics.push({
        label: "Estimated Timeline",
        value: `${timelineMatch[1]} weeks`,
        icon: Clock,
        color: "text-accent",
      });
    }

    // Look for phases
    const phasesMatch = text.match(/(\d+)\s+of\s+(\d+)\s+phases/i);
    if (phasesMatch) {
      metrics.push({
        label: "Migration Progress",
        value: `${phasesMatch[1]}/${phasesMatch[2]} phases`,
        icon: CheckCircle2,
        color: "text-accent",
      });
    }

    return metrics;
  };

  const metrics = extractMetrics(report);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with metrics */}
      <Card className="border-2 shadow-card-hover transition-smooth">
        <CardHeader className="gradient-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  Project Analysis Report
                </CardTitle>
                <CardDescription className="text-primary-foreground/80 mt-1">
                  AI-powered comprehensive code analysis
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={onDownload}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>

        {metrics.length > 0 && (
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.map((metric, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50 border border-border transition-smooth hover:shadow-md hover:scale-105"
                >
                  <div
                    className={`p-3 rounded-lg bg-background ${metric.color}`}
                  >
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-xl font-bold">{metric.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Report sections */}
      <div className="grid gap-6">
        {sections.map((section, index) => {
          const isHeading = section.length < 100 && !section.includes(".");
          const hasWarning =
            section.toLowerCase().includes("vulnerability") ||
            section.toLowerCase().includes("deprecated") ||
            section.toLowerCase().includes("risk");
          const hasSuccess =
            section.toLowerCase().includes("recommend") ||
            section.toLowerCase().includes("best practice");

          if (isHeading) {
            return (
              <div key={index} className="flex items-center gap-3 mt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                <h3 className="text-lg font-semibold text-foreground px-4">
                  {section}
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            );
          }

          return (
            <Card
              key={index}
              className="shadow-card transition-smooth hover:shadow-card-hover"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  {hasWarning && (
                    <div className="p-2 rounded-lg bg-destructive/10 text-destructive mt-1">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                  )}
                  {hasSuccess && (
                    <div className="p-2 rounded-lg bg-accent/10 text-accent mt-1">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap font-mono">
                      {section}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full report card */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Complete Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-secondary/30 rounded-lg p-6 max-h-96 overflow-auto border border-border">
            <pre className="text-sm font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
              {report}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
