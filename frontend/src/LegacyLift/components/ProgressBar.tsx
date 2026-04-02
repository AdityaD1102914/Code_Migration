import {
  Brain,
  FileCode,
  BarChart3,
  Shield,
  CheckCircle2,
  Upload,
  Layers,
  Lightbulb,
} from "lucide-react";
import { Card } from "./ui/card";
import { useEffect, useState } from "react";
import { AnalysisData } from "@/LegacyLift/types/analysis";

const ProgressBar = ({
  isReportData,
}: {
  isReportData?: boolean;
  analysisAPIData?: string | AnalysisData | null;
}) => {
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  // ***********************
  useEffect(() => {
    const steps = [
      { progress: 10, step: "Upload & Validate Project", delay: 800 },
      { progress: 25, step: "Framework & Tech Stack Detection", delay: 1000 },
      { progress: 40, step: "Dependency & Compatibility Check", delay: 1200 },
      { progress: 55, step: "Complexity & Code Quality Analysis", delay: 1000 },
      { progress: 70, step: "Security & Vulnerability Scan", delay: 900 },
      { progress: 85, step: "Generate Modernization Strategy", delay: 800 },
      { progress: 90, step: "Final Report & Recommendations", delay: 700 },
    ];

    let isMounted = true;

    const runSteps = async () => {
      for (const step of steps) {
        if (!isMounted) break;
        await new Promise((resolve) => setTimeout(resolve, step.delay));
        setAnalysisProgress(step.progress);
        setCurrentStep(step.step);
      }
    };

    runSteps();

    return () => {
      isMounted = false;
    };
  }, []); // Runs once on mount

  useEffect(() => {
    if (isReportData === true) {
      setTimeout(() => {
        setAnalysisProgress(100);
        setCurrentStep("Complete");
      }, 500); // Optional delay before showing "Complete"
    }
  }, [isReportData]); // Completes only when isReportData becomes true

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <Card className="overflow-hidden shadow-2xl border-0">
        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg animate-pulse">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                AI Analysis in Progress
              </h3>
              <p className="text-gray-600">
                Our AI is analyzing your codebase and preparing migration
                recommendations
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  Processing files...
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {analysisProgress}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/60 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out relative"
                  style={{ width: `${analysisProgress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                {
                  progress: 10,
                  name: "Upload & Validate Project",
                  icon: Upload,
                },
                {
                  progress: 25,
                  name: "Framework & Tech Stack Detection",
                  icon: FileCode,
                },
                {
                  progress: 40,
                  name: "Dependency & Compatibility Check",
                  icon: Layers,
                },
                {
                  progress: 55,
                  name: "Complexity & Code Quality Analysis",
                  icon: BarChart3,
                },
                {
                  progress: 70,
                  name: "Security & Vulnerability Scan",
                  icon: Shield,
                },
                {
                  progress: 85,
                  name: "Generate Modernization Strategy",
                  icon: Lightbulb,
                },
                {
                  progress: 100,
                  name: "Final Report & Recommendations",
                  icon: CheckCircle2,
                },
              ].map((item) => {
                const isComplete = analysisProgress >= item.progress;
                const isCurrent = currentStep
                  .toLowerCase()
                  .includes(item.name.toLowerCase().split(" ")[0]);
                const IconComponent = item.icon;

                return (
                  <div
                    key={item.name}
                    className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${isCurrent
                        ? "bg-white shadow-lg scale-105 ring-2 ring-blue-500"
                        : isComplete
                          ? "bg-white/70 shadow"
                          : "bg-white/40"
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${isComplete
                          ? "bg-gradient-to-br from-green-400 to-emerald-500 shadow-md"
                          : isCurrent
                            ? "bg-gradient-to-br from-blue-400 to-purple-500 shadow-md animate-pulse"
                            : "bg-gray-200"
                        }`}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <IconComponent
                          className={`w-6 h-6 ${isCurrent ? "text-white" : "text-gray-400"
                            }`}
                        />
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium text-center transition-colors ${isCurrent
                          ? "text-gray-900"
                          : isComplete
                            ? "text-gray-700"
                            : "text-gray-500"
                        }`}
                    >
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {currentStep && (
              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    {currentStep}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressBar;
