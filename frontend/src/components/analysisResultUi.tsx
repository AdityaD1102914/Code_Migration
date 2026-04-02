import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import {
  getPhaseIcon,
  getPhaseColor,
  getColorClasses,
} from "../utils/react/phaseUtils";
interface Strategy {
  title: string;
  category?: string;
  priority?: string;
  description: string;
}

const ResultsSection = ({
  analysisResult,
  onConvert,
  hasClassComponents,
}: any) => {
  const [expandedPhases, setExpandedPhases] = useState<any>({});
  const [showAntiPatterns, setShowAntiPatterns] = useState(false);
  const [showStrategies, setShowStrategies] = useState(false);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev: any) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-600 bg-red-50";
      case "high":
        return "border-orange-500 bg-orange-50";
      case "medium":
        return "border-yellow-500 bg-yellow-50";
      default:
        return "border-blue-500 bg-blue-50";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  return (
    <>
      {/* Convert CTA - Show if there are class components */}
      {hasClassComponents && analysisResult.classComponents > 0 && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="text-white">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="w-6 h-6" />
                {analysisResult.classComponents} Class Components Detected
              </h3>
              <p className="text-indigo-100 mt-1">
                Convert them to modern functional components with React Hooks
              </p>
            </div>
            <button
              onClick={onConvert}
              className="bg-white text-indigo-600 py-3 px-6 rounded-lg font-bold hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg"
            >
              Convert Components
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Analysis Results
        </h3>

        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 font-medium">
              Total Components
            </p>
            <p className="text-3xl font-bold text-blue-900">
              {analysisResult.totalComponents}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-600 font-medium">
              Class Components
            </p>
            <p className="text-3xl font-bold text-orange-900">
              {analysisResult.classComponents}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 font-medium">
              Estimated Timeline
            </p>
            <p className="text-3xl font-bold text-green-900">
              {analysisResult.estimatedWeeks}w
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 font-medium">Risk Level</p>
            <p className="text-3xl font-bold text-purple-900">
              {analysisResult.riskLevel}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">
            Complexity Breakdown
          </h4>
          <div className="flex gap-6">
            <div>
              <span className="text-sm text-gray-600">Simple: </span>
              <span className="font-bold text-gray-900">
                {analysisResult.complexity?.simple || 0}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Medium: </span>
              <span className="font-bold text-gray-900">
                {analysisResult.complexity?.medium || 0}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Complex: </span>
              <span className="font-bold text-gray-900">
                {analysisResult.complexity?.complex || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anti-Patterns Section */}
      {analysisResult.antiPatterns &&
        analysisResult.antiPatterns.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowAntiPatterns(!showAntiPatterns)}
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Detected Anti-Patterns
                </h3>
                <span className="text-sm text-gray-500 bg-red-100 px-3 py-1 rounded-full">
                  {analysisResult.antiPatterns.length} Issues Found
                </span>
              </div>
              <button
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={
                  showAntiPatterns ? "Hide anti-patterns" : "Show anti-patterns"
                }
              >
                {showAntiPatterns ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {showAntiPatterns && (
              <div className="space-y-4 mt-6">
                {analysisResult.antiPatterns.map(
                  (pattern: any, index: number) => (
                    <div
                      key={index}
                      className={`border-l-4 rounded-lg p-4 ${getSeverityColor(
                        pattern.severity
                      )}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">
                              {pattern.name}
                            </h4>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${getSeverityBadge(
                                pattern.severity
                              )}`}
                            >
                              {pattern.severity}
                            </span>
                            {pattern.impact && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                {pattern.impact}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {pattern.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

      {/* Recommended Strategies Section */}
      {analysisResult.recommendedStrategies &&
        analysisResult.recommendedStrategies.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowStrategies(!showStrategies)}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-semibold text-gray-900">
                  Recommended Migration Strategies
                </h3>
                <span className="text-sm text-gray-500 bg-green-100 px-3 py-1 rounded-full">
                  {analysisResult.recommendedStrategies.length} Strategies
                </span>
              </div>
              <button
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label={
                  showStrategies ? "Hide strategies" : "Show strategies"
                }
              >
                {showStrategies ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>
            </div>

            {showStrategies && (
              <div className="space-y-4 mt-6">
                {analysisResult.recommendedStrategies.map(
                  (strategy: Strategy, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 bg-green-50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">
                              {strategy.title}
                            </h4>
                            {strategy.category && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {strategy.category}
                              </span>
                            )}
                            {strategy.priority && (
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  strategy.priority === "high"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {strategy.priority} priority
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {strategy.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        )}

      {/* Migration Roadmap Section */}
      {analysisResult.phases && analysisResult.phases.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              AI-Generated Migration Roadmap
            </h3>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {analysisResult.phases.length} Phases
            </span>
          </div>
          <div className="space-y-6">
            {analysisResult.phases.map((phase: any) => {
              const Icon = getPhaseIcon(phase.title);
              const color = getPhaseColor(phase.id);
              const isExpanded = expandedPhases[phase.id] === true;

              return (
                <div
                  key={phase.id}
                  className={`border-2 rounded-lg p-6 ${getColorClasses(
                    color
                  )}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-bold">
                          Phase {phase.id}: {phase.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 bg-white px-3 py-1 rounded-full">
                            {phase.estimatedTime}
                          </span>
                          <button
                            onClick={() => togglePhase(phase.id)}
                            className="p-1 hover:bg-white rounded-full transition-colors"
                            aria-label={
                              isExpanded ? "Collapse phase" : "Expand phase"
                            }
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <>
                          <p className="text-sm mt-2 leading-relaxed">
                            {phase.description}
                          </p>

                          {phase.insights && phase.insights.length > 0 && (
                            <div className="mt-4 space-y-2">
                              {phase.insights.map(
                                (insight: any, index: number) => {
                                  const getBorderColor = () => {
                                    if (insight.priority === "high")
                                      return "border-red-500";
                                    if (insight.priority === "medium")
                                      return "border-yellow-500";
                                    return "border-blue-500";
                                  };

                                  const getBadgeColor = () => {
                                    if (insight.category === "task")
                                      return "bg-purple-100 text-purple-700";
                                    if (insight.category === "insight")
                                      return "bg-green-100 text-green-700";
                                    if (insight.category === "capability")
                                      return "bg-blue-100 text-blue-700";
                                    if (insight.category === "tool")
                                      return "bg-gray-100 text-gray-700";
                                    return "bg-gray-100 text-gray-700";
                                  };

                                  return (
                                    <div
                                      key={index}
                                      className={`bg-white rounded-lg p-3 border-l-4 ${getBorderColor()} hover:shadow-md transition-shadow`}
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-grow">
                                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <h5 className="font-semibold text-gray-900 text-sm">
                                              {insight.title}
                                            </h5>
                                            {insight.category && (
                                              <span
                                                className={`text-xs px-2 py-0.5 rounded-full ${getBadgeColor()}`}
                                              >
                                                {insight.category}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-gray-600 leading-relaxed">
                                            {insight.description}
                                          </p>
                                        </div>
                                        {insight.actionRequired && (
                                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0 h-fit">
                                            Action Required
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default ResultsSection;
