import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown, ChevronUp,
  Boxes,
  Settings2,
  Wrench,
  Code2,
  Route,
  Filter,
  FileCode,
  Link,
  AlertTriangle,
  Clock,
  Shield,
  Gauge,
} from "lucide-react";
import {
  getPhaseIcon,
  getPhaseColor,
  getColorClasses,
} from "../../utils/react/phaseUtils";
import {
  hasText,
  TAB_META,
  TAB_COLORS,
  categoryBadge,
  priorityBadge,
  priorityDot,
  type TabKey,
} from "../../utils/react/analyze-result";

// ---------- Child: PhaseTabs (same interaction pattern as ReactResultsSection) ----------
const PhaseTabs: React.FC<{ phase: any }> = ({ phase }) => {
  const buckets = useMemo(() => {
    const b: Record<TabKey, any[]> = {
      overview: [],
      task: [],
      insight: [],
      capability: [],
      tool: [],
    };
    (phase.insights || []).forEach((ins: any) => {
      const k = (ins?.category || "default").toLowerCase();
      if (k === "overview" || k === "task" || k === "insight" || k === "capability" || k === "tool") {
        b[k as TabKey].push(ins);
      } else {
        b.insight.push(ins);
      }
    });
    return b;
  }, [phase.insights]);

  const initialKey: TabKey =
    hasText(phase.description)
      ? "overview"
      : buckets.task.length
        ? "task"
        : (TAB_META.find((t) => (buckets[t.key] || []).length)?.key ?? "overview");

  const [active, setActive] = useState<TabKey>(initialKey);

  const TabBar = (
    <div className="rounded-xl border border-gray-200 p-1 bg-gradient-to-r from-gray-50 via-white to-gray-50">
      <div className="flex flex-wrap gap-1">
        {TAB_META.map(({ key, label, Icon }) => {
          const isActive = active === key;
          const hasContent = key === "overview" ? hasText(phase.description) : ((buckets[key] || []).length > 0);
          const colors = TAB_COLORS[key];
          const base = "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all";
          const activeCls = `bg-gradient-to-r ${colors.activeBg} ${colors.activeText} border ${colors.activeBorder} shadow-sm cursor-pointer`;
          const inactiveCls = `text-gray-700 ${colors.hoverBg} border border-transparent cursor-pointer`;
          const disabledCls = "text-gray-400 cursor-not-allowed opacity-60";
          const classes = hasContent ? `${base} ${isActive ? activeCls : inactiveCls}` : `${base} ${disabledCls}`;

          return (
            <button
              key={key}
              type="button"
              className={classes}
              onClick={() => hasContent && setActive(key)}
              aria-disabled={!hasContent}
            >
              {/* You can optionally add per-tab small icons here if needed */}
              <Icon className={`w-4 h-4 ${isActive ? colors.iconActive : colors.iconInactive}`} />
              <span className="font-medium">{label}</span>
              {key !== "overview" && hasContent && (
                <span className={`ml-2 text-[11px] px-1.5 py-0.5 rounded-full ${colors.badgeBg} ${colors.badgeText}`}>
                  {(buckets[key] || []).length}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const Content = () => {
    if (active === "overview") {
      return hasText(phase.description) ? (
        <div className="mt-3 rounded-2xl border border-gray-200 bg-gradient-to-r from-white via-indigo-50 to-transparent p-5">
          <p className="text-[15px] leading-7 text-gray-900">{phase.description}</p>
          <div className="mt-3 grid sm:grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/80 border border-gray-200 px-3 py-2 text-sm text-gray-700">
              • Modern AngularJS migration considerations
            </div>
            <div className="rounded-lg bg-white/80 border border-gray-200 px-3 py-2 text-sm text-gray-700">
              • Consider modularization & AOT-friendly patterns
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No overview provided for this phase.
        </div>
      );
    }

    const items = buckets[active] || [];
    if (!items.length) {
      return (
        <div className="mt-3 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No entries found under <span className="font-medium">{active}</span>.
        </div>
      );
    }

    return (
      <div className="mt-3 space-y-3">
        {items.map((insight: any, idx: number) => {
          const p = (insight.priority || "default").toLowerCase();
          const c = (insight.category || "default").toLowerCase();

          return (
            <div
              key={idx}
              className="group flex items-start justify-between rounded-2xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm hover:shadow-md hover:-translate-y-[1px] transition"
            >
              <div className="flex items-start gap-3 min-w-0">
                <span className={`mt-[6px] h-2.5 w-2.5 rounded-full ${priorityDot[p] || priorityDot.default}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h5 className="font-semibold text-gray-900 text-sm truncate">{insight.title}</h5>
                    {insight.category && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${categoryBadge[c] || categoryBadge.default}`}>
                        {insight.category}
                      </span>
                    )}
                    {insight.priority && (
                      <span className={`text-[11px] px-2 py-0.5 rounded-full ${priorityBadge[p] || priorityBadge.default}`}>
                        {insight.priority}
                      </span>
                    )}
                  </div>
                  {hasText(insight.description) && (
                    <p className="text-sm text-gray-600 mt-0.5 truncate">{insight.description}</p>
                  )}
                </div>
              </div>

              {insight.actionRequired && (
                <span className="text-xs font-medium bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-200 whitespace-nowrap">
                  Action Required
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {TabBar}
      <Content />
    </>
  );
};

// ---------- Main component (prop-only; no router state) ----------
const AngularResultsSection = ({ analysisResult: analysisResultProp }: { analysisResult?: any }) => {
  const location = useLocation();

  // Fallback: try to read from location.state if prop not passed
  const initial = analysisResultProp ?? (location?.state as any)?.analysisResult ?? null;

  // Keep local state that syncs with prop updates
  const [analysisResult, setAnalysisResult] = useState<any>(initial);

  useEffect(() => {
    // Only update local state when prop actually changes (not undefined -> undefined loops)
    if (analysisResultProp !== undefined) {
      setAnalysisResult(analysisResultProp);
    }
  }, [analysisResultProp]);

  const [expandedPhases, setExpandedPhases] = useState<Record<number, boolean>>({});
  const [showAntiPatterns, setShowAntiPatterns] = useState<boolean>(false);
  const [showStrategies, setShowStrategies] = useState<boolean>(false);

  const togglePhase = (phaseId: number) => {
    setExpandedPhases((prev) => ({ ...prev, [phaseId]: !prev[phaseId] }));
  };

  const getSeverityColor = (severity?: string) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return "border-red-600 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-amber-500 bg-amber-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const getSeverityBadge = (severity?: string) => {
    switch ((severity || "").toLowerCase()) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  // Optional guard (keeps component stable without extra state sources)
  if (!analysisResult) {
    return (
      <div className="container mx-auto max-w-screen-2xl mt-10 mb-10 px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <p className="text-gray-700">
            No Angular analysis data provided. Pass{" "}
            <code className="text-gray-900">analysisResult</code> as a prop.
          </p>
        </div>
      </div>
    );
  }

  // Pull arrays safely if your data shape varies in case or naming
  const antiPatternsArr =
    analysisResult?.AntiPatterns ??
    analysisResult?.antiPatterns; // prefer array of {name, severity, impact, description}
  const strategiesArr =
    analysisResult?.RecommendedStrategies ??
    analysisResult?.recommendedStrategies;
  const phasesArr =
    analysisResult?.MigrationPhases ??
    analysisResult?.phases;

  return (
    <>
      {/* Page container: consistent L/R padding + max width */}
      <div className="container mx-auto max-w-screen-2xl mt-10 mb-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* ---------- Stats Section ---------- */}

          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h3>

            {/* Keep Angular metrics, now with icons */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Modules", value: analysisResult?.modules, Icon: Boxes, bg: "from-blue-50 to-blue-100 border-blue-200" },
                { label: "Controllers", value: analysisResult?.controllers, Icon: Settings2, bg: "from-amber-50 to-amber-100 border-amber-200" },
                { label: "Services", value: analysisResult?.services, Icon: Wrench, bg: "from-purple-50 to-purple-100 border-purple-200" },
                { label: "Directives", value: analysisResult?.directives, Icon: Code2, bg: "from-blue-50 to-blue-100 border-blue-200" },
                { label: "Route Configuration", value: analysisResult?.RouteConfiguration, Icon: Route, bg: "from-amber-50 to-amber-100 border-amber-200" },
                { label: "Filters", value: analysisResult?.filters, Icon: Filter, bg: "from-purple-50 to-purple-100 border-purple-200" },
                { label: "HTML Template", value: analysisResult?.HTMLTemplate, Icon: FileCode, bg: "from-blue-50 to-blue-100 border-blue-200" },
                { label: "Dependencies", value: analysisResult?.dependencies, Icon: Link, bg: "from-amber-50 to-amber-100 border-amber-200" },
                {
                  label: "Anti Patterns",
                  value: Array.isArray(antiPatternsArr) ? antiPatternsArr.length : analysisResult?.antiPatterns,
                  Icon: AlertTriangle,
                  bg: "from-purple-50 to-purple-100 border-purple-200",
                },
                { label: "Estimated Timeline", value: `${analysisResult?.EstimatedMigrationTimeline ?? ""}w`, Icon: Clock, bg: "from-blue-50 to-blue-100 border-blue-200" },
                { label: "Risk Level", value: analysisResult?.RiskLevel, Icon: Shield, bg: "from-amber-50 to-amber-100 border-amber-200" },
              ].map(({ label, value, Icon, bg }, idx) => (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border bg-gradient-to-br ${bg} hover:shadow-sm transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-700">
                        {label}
                      </p>
                      <p className="text-3xl font-extrabold text-gray-900 mt-1">{value ?? "—"}</p>
                    </div>

                    {/* Icon bubble */}
                    <div className="shrink-0">
                      <div className="w-9 h-9 rounded-full bg-white/70 backdrop-blur-sm border border-gray-200 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-gray-700" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Complexity */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="font-semibold text-gray-900">Complexity Breakdown</h4>
                {/* small label icon */}
                <Gauge className="w-4 h-4 text-gray-600" aria-hidden />
              </div>

              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                    {/* chip icon */}
                    <Gauge className="w-3 h-3" />
                    Simple
                  </span>
                  <span className="font-bold text-gray-900">
                    {analysisResult?.Complexity?.Simple ?? analysisResult?.complexity?.Simple ?? "0"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    <Gauge className="w-3 h-3" />
                    Medium
                  </span>
                  <span className="font-bold text-gray-900">
                    {analysisResult?.Complexity?.Medium ?? analysisResult?.complexity?.Medium ?? "0"}
                  </span>
                </span>

                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                    <Gauge className="w-3 h-3" />
                    Complex
                  </span>
                  <span className="font-bold text-gray-900">
                    {analysisResult?.Complexity?.Complex ?? analysisResult?.complexity?.Complex ?? "0"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Anti-Patterns ---------- */}
          {Array.isArray(antiPatternsArr) && antiPatternsArr.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAntiPatterns(!showAntiPatterns)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-red-100 text-red-700">!</span>
                  <h3 className="text-xl font-semibold text-gray-900">Detected Anti-Patterns</h3>
                  <span className="text-sm text-gray-800 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    {antiPatternsArr.length} Issues Found
                  </span>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={showAntiPatterns ? "Hide anti-patterns" : "Show anti-patterns"}
                >
                  {showAntiPatterns ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showAntiPatterns && (
                <div className="space-y-4 mt-6">
                  {antiPatternsArr.map((pattern: any, index: number) => (
                    <div
                      key={index}
                      className={`rounded-xl p-4 border-l-4 ${getSeverityColor(pattern.severity)} hover:shadow-sm transition-shadow`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-bold text-gray-900">{pattern.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(pattern.severity)}`}>
                              {pattern.severity}
                            </span>
                            {pattern.impact && (
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">{pattern.impact}</span>
                            )}
                          </div>
                          {hasText(pattern.description) && (
                            <p className="text-sm text-gray-700 leading-relaxed">{pattern.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------- Strategies ---------- */}
          {Array.isArray(strategiesArr) && strategiesArr.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowStrategies(!showStrategies)}
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-green-100 text-green-700">✓</span>
                  <h3 className="text-xl font-semibold text-gray-900">Recommended Migration Strategies</h3>
                  <span className="text-sm text-gray-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    {strategiesArr.length} Strategies
                  </span>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={showStrategies ? "Hide strategies" : "Show strategies"}
                >
                  {showStrategies ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>

              {showStrategies && (
                <div className="space-y-4 mt-6">
                  {strategiesArr.map((strategy: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-xl p-4 border-l-4 border-green-500 bg-green-50 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="font-semibold text-gray-900">{strategy.title}</h4>
                            {strategy.category && (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                {strategy.category}
                              </span>
                            )}
                            {strategy.priority && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${strategy.priority === "high"
                                  ? "bg-orange-100 text-orange-800"
                                  : strategy.priority === "medium"
                                    ? "bg-amber-100 text-amber-800"
                                    : "bg-blue-100 text-blue-800"
                                  }`}
                              >
                                {strategy.priority} priority
                              </span>
                            )}
                          </div>
                          {hasText(strategy.description) && (
                            <p className="text-sm text-gray-700 leading-relaxed">{strategy.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ---------- Migration Roadmap ---------- */}
          {Array.isArray(phasesArr) && phasesArr.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">AI-Generated Migration Roadmap</h3>
                <span className="text-sm text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                  {phasesArr.length} Phases
                </span>
              </div>

              <div className="space-y-4">
                {phasesArr.map((phase: any) => {
                  const Icon = getPhaseIcon(phase.title);
                  const color = getPhaseColor(phase.id);
                  const descriptionExists = hasText(phase.description);
                  const isExpanded = descriptionExists ? expandedPhases[phase.id] === true : true;

                  return (
                    <div
                      key={phase.id}
                      className={`border-2 rounded-xl p-5 ${getColorClasses(color)} hover:shadow-md transition-shadow`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm ring-1 ring-gray-200">
                            <Icon className="w-6 h-6 text-gray-700" />
                          </div>
                        </div>

                        <div className="flex-grow">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-lg font-bold text-gray-900">
                              Phase {phase.id}: {phase.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-xs md:text-sm text-gray-800 bg-white border border-gray-200 px-3 py-1 rounded-full">
                                {phase?.estimatedTime ?? "No estimated time"}
                              </span>

                              {descriptionExists && (
                                <button
                                  onClick={() =>
                                    togglePhase(phase.id)
                                  }
                                  className="p-2 hover:bg-white rounded-full transition-colors border border-gray-200"
                                  aria-label={isExpanded ? "Collapse phase" : "Expand phase"}
                                  title={isExpanded ? "Collapse" : "Expand"}
                                >
                                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="mt-3">
                              <PhaseTabs phase={phase} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AngularResultsSection;