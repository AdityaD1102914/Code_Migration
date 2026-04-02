export interface Project {
  name: string;
  language: string;
  files: number;
  size_kb: number;
}

export interface ComponentHierarchy {
  summary: string;
  issues: string[];
  examples: string[];
}

export interface Modularity {
  summary: string;
  issues: string[];
  examples: string[];
}

export interface OutdatedCode {
  summary: string;
  issues: string[];
  examples: string[];
}

export interface MixedPatterns {
  summary: string;
  issues: string[];
  examples: string[];
}

export interface LegacyStateManagement {
  present: boolean;
  description: string;
  examples: string[];
}

export interface Analysis {
  complexity_score: number;
  component_hierarchy: ComponentHierarchy;
  modularity: Modularity;
  outdated_code: OutdatedCode;
  mixed_patterns: MixedPatterns;
  legacy_state_management: LegacyStateManagement;
}

export interface Dependency {
  name: string;
  version: string;
  status: string;
  issues: string[];
}

export interface Dependencies {
  total: number;
  outdated: number;
  vulnerable: number;
  list: Dependency[];
}

export interface Vulnerabilities {
  count: number;
  risk_level: string;
  details: unknown[];
}

export interface MigrationPhase {
  name: string;
  description: string;
  estimated_time_weeks: string;
  progress_percent: number;
  deliverables: string[];
  tools_used: string[];
}

export interface MigrationStrategy {
  overview: string;
  benefits: string[];
  risks: string[];
  technical_considerations: string[];
}

export interface Migration {
  recommended_framework: string;
  suggested_tools: string[];
  strategy: MigrationStrategy;
  phases: MigrationPhase[];
}

export interface AITools {
  legacy_analysis: {
    method: string;
    findings: string[];
  };
  dependency_mapping: {
    method: string;
    findings: string[];
  };
  complexity_scoring: {
    method: string;
    rationale: string;
  };
  anti_pattern_detection: {
    method: string;
    patterns_found: string[];
  };
}

export interface Progress {
  completed_phases: number;
  total_phases: number;
  milestones: string[];
}

export interface AnalysisData {
  project: Project;
  analysis: Analysis;
  dependencies: Dependencies;
  vulnerabilities: Vulnerabilities;
  migration: Migration;
  ai_tools: AITools;
  progress: Progress;
}

export interface AnalysisReportProps {
  report: string;
  onDownload: () => void;
}

export interface ConvertedCodeProps {
  code: string;
  onDownload: () => void;
}

export interface FeatureMapping {
  id: string;
  legacyFeature: string;
  reactEquivalent: string;
  description: string;
  category: "rendering" | "state" | "routing" | "data" | "ui";
  complexity: "low" | "medium" | "high";
  benefits: string[];
}

export interface Improvement {
  title: string;
  stat: string;
  description: string;
}
export interface AnalysisPageProps {
  analysisAPIData: string | AnalysisData[];
}