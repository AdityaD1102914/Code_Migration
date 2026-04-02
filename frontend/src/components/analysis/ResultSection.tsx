import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  LayoutGrid,
  Layers,
  Clock,
  Shield,
} from "lucide-react";
import { getPhaseIcon, getPhaseColor, getColorClasses } from "../../utils/react/phaseUtils";
import {
  hasText,
  TAB_META,
  TAB_COLORS,
  categoryBadge,
  priorityBadge,
  priorityDot,
  type TabKey,
} from "../../utils/react/analyze-result";

// ---------- Child: PhaseTabs ----------
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
              • Modern React patterns detected
            </div>
            <div className="rounded-lg bg-white/80 border border-gray-200 px-3 py-2 text-sm text-gray-700">
              • Consider Context to reduce prop drilling
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

// ---------- Main component ----------
const ReactResultsSection: React.FC<{ analysisResult?: any }> = ({ analysisResult: analysisResultProp }) => {
  const location = useLocation();

  // Fallback: try to read from location.state if prop not passed
  const initial = analysisResultProp ?? (location?.state as any)?.analysisResult ?? null;

  // Local state that syncs with prop updates
  const [analysisResult, setAnalysisResult] = useState<any>(initial);

  useEffect(() => {
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
    switch (severity) {
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
    switch (severity) {
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

  // 🟢 Seed expanded state whenever phases change (collapsed by default)
  useEffect(() => {
    const phases = analysisResult?.phases || [];
    if (!Array.isArray(phases) || phases.length === 0) return;

    setExpandedPhases((prev) => {
      // If we've already seeded or user toggled, keep as-is
      if (Object.keys(prev).length > 0) return prev;

      const seeded: Record<number, boolean> = {};
      phases.forEach((p: any) => {
        // collapsed by default
        seeded[p.id] = false;
      });
      return seeded;
    });
  }, [analysisResult?.phases]);

  // Guard: if no data, show a friendly empty state
  if (!analysisResult) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
          <p className="text-gray-700">
            No analysis data available. Pass <code className="text-gray-900">analysisResult</code> as a prop or
            navigate with <code className="text-gray-900">location.state.analysisResult</code>.
          </p>
        </div>
      </div>
    );
  }

  // Page wrapper added here for left/right padding & max width
  return (
    <>
      <div className="container mx-auto max-w-screen-2xl mt-10 mb-10 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* ---------- Stats Section ---------- */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Analysis Results</h3>

            <div className="grid md:grid-cols-5 gap-4 mb-6">
              <div className="rounded-xl p-4 border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide">Total Components</p>
                  <LayoutGrid className="w-5 h-5 text-blue-800 opacity-70" />
                </div>
                <p className="text-3xl font-extrabold text-blue-900 mt-1">{analysisResult.totalComponents}</p>
              </div>

              <div className="rounded-xl p-4 border bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-orange-700 uppercase tracking-wide">Class Components</p>
                  <Layers className="w-5 h-5 text-orange-800 opacity-70" />
                </div>
                <p className="text-3xl font-extrabold text-orange-900 mt-1">{analysisResult.classComponents}</p>
              </div>

              <div className="rounded-xl p-4 border bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wide">Functional Components</p>
                  <Layers className="w-5 h-5 text-indigo-800 opacity-70" />
                </div>
                <p className="text-3xl font-extrabold text-indigo-900 mt-1">{analysisResult.functionalComponents}</p>
              </div>

              <div className="rounded-xl p-4 border bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-green-700 uppercase tracking-wide">Estimated Timeline</p>
                  <Clock className="w-5 h-5 text-green-800 opacity-70" />
                </div>
                <p className="text-3xl font-extrabold text-green-900 mt-1">{analysisResult.estimatedWeeks}w</p>
              </div>

              <div className="rounded-xl p-4 border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wide">Risk Level</p>
                  <Shield className="w-5 h-5 text-purple-800 opacity-70" />
                </div>
                <p className="text-3xl font-extrabold text-purple-900 mt-1">{analysisResult.riskLevel}</p>
              </div>
            </div>

            {/* Complexity */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Complexity Breakdown</h4>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800">Simple</span>
                  <span className="font-bold text-gray-900">{analysisResult.complexity.simple}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Medium</span>
                  <span className="font-bold text-gray-900">{analysisResult.complexity.medium}</span>
                </span>
                <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800">Complex</span>
                  <span className="font-bold text-gray-900">{analysisResult.complexity.complex}</span>
                </span>
              </div>
            </div>
          </div>

          {/* ---------- Anti-Patterns ---------- */}
          {analysisResult.antiPatterns && analysisResult.antiPatterns.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowAntiPatterns(!showAntiPatterns)}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Detected Anti-Patterns</h3>
                  <span className="text-sm text-gray-800 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                    {analysisResult.antiPatterns.length} Issues Found
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
                  {analysisResult.antiPatterns.map((pattern: any, index: number) => (
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
          {analysisResult.recommendedStrategies && analysisResult.recommendedStrategies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setShowStrategies(!showStrategies)}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Recommended Migration Strategies</h3>
                  <span className="text-sm text-gray-800 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                    {analysisResult.recommendedStrategies.length} Strategies
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
                  {analysisResult.recommendedStrategies.map((strategy: any, index: number) => (
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

          {/* ---------- Migration Roadmap (fixed collapse/expand) ---------- */}
          {analysisResult.phases && analysisResult.phases.length > 0 && (
            <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 ring-1 ring-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">AI-Generated Migration Roadmap</h3>
                <span className="text-sm text-gray-800 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                  {analysisResult.phases.length} Phases
                </span>
              </div>

              <div className="space-y-4">
                {analysisResult.phases.map((phase: any) => {
                  const Icon = getPhaseIcon(phase.title);
                  const color = getPhaseColor(phase.id);

                  // ✅ Drive expansion solely from expandedPhases (seeded via effect)
                  const isExpanded = expandedPhases[phase.id] === true;

                  const handleToggle = () => togglePhase(phase.id);

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

                            {/* Toggle area (badge + chevron) */}
                            <div
                              className="flex items-center gap-2 select-none cursor-pointer"
                              onClick={handleToggle}
                              role="button"
                              tabIndex={0}
                              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleToggle()}
                            >
                              <span className="text-xs md:text-sm text-gray-800 bg-white border border-gray-200 px-3 py-1 rounded-full">
                                {phase?.estimatedTime ?? "No estimated time"}
                              </span>

                              {/* Always show chevron */}
                              <button
                                type="button"
                                className="p-2 hover:bg-white rounded-full transition-colors border border-gray-200"
                                aria-label={isExpanded ? "Collapse phase" : "Expand phase"}
                                title={isExpanded ? "Collapse" : "Expand"}
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
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

export default ReactResultsSection;
