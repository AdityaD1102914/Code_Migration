import { useEffect, useState } from "react";
import {
  ArrowRight,
  Code2,
  Box,
  RefreshCw,
  Layers,
  TrendingUp,
  CheckCircle2,
  Gauge,
  Users,
  ScanSearch,
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useAppContext } from "@/LegacyLift/contexts/useContext";
import MigrationAnalysis from "@/LegacyLift/components/MigrationAnalysis";
import { useNavigate } from "react-router-dom";
import { FileExplorer } from "@/LegacyLift/components/FileExplorer";
import { ProjectFile } from '@/LegacyLift/types/fileExplorerType';
import { FeatureMapping } from "@/LegacyLift/types/analysis";


function MigrationUI() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "complexity">("name");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { projectJson, migrationReportJson, analysisReportJson } = useAppContext();

  const files: ProjectFile[] = Array.isArray(projectJson)
    ? projectJson
    : projectJson?.files ?? [];

  const featureMappings: FeatureMapping[] = [
    {
      id: "1",
      legacyFeature: "JSP Pages & Servlets",
      reactEquivalent: "React Components",
      description:
        "Server-side rendered pages replaced with reusable, composable React components with client-side rendering",
      category: "rendering",
      complexity: "high",
      benefits: ["Reusability", "Better Performance", "Modularity"],
    },
    {
      id: "2",
      legacyFeature: "Session Attributes",
      reactEquivalent: "useState / useContext",
      description:
        "Server-side session management migrated to client-side state management using React hooks",
      category: "state",
      complexity: "medium",
      benefits: ["Real-time Updates", "Type Safety", "Predictable State"],
    },
    {
      id: "3",
      legacyFeature: "JSP Include Directives",
      reactEquivalent: "Component Composition",
      description:
        "Static includes replaced with dynamic component composition and props passing",
      category: "ui",
      complexity: "low",
      benefits: ["Dynamic Loading", "Props Flow", "Better Testing"],
    },
    {
      id: "4",
      legacyFeature: "JSTL Core Tags",
      reactEquivalent: "JSX & JavaScript",
      description:
        "Template logic replaced with JavaScript expressions and JSX syntax for better type checking",
      category: "rendering",
      complexity: "medium",
      benefits: ["Type Safety", "IDE Support", "Debugging"],
    },
    {
      id: "5",
      legacyFeature: "Request Dispatching",
      reactEquivalent: "React Router",
      description:
        "Server-side routing replaced with client-side routing for SPA navigation",
      category: "routing",
      complexity: "medium",
      benefits: ["Instant Navigation", "Browser History", "Code Splitting"],
    },
    {
      id: "6",
      legacyFeature: "JDBC Connections",
      reactEquivalent: "REST APIs / GraphQL",
      description:
        "Direct database connections replaced with API-based data fetching using hooks",
      category: "data",
      complexity: "high",
      benefits: ["Decoupled Architecture", "Caching", "Error Handling"],
    },
    {
      id: "7",
      legacyFeature: "jQuery DOM Manipulation",
      reactEquivalent: "Virtual DOM / useRef",
      description:
        "Imperative DOM updates replaced with declarative React rendering and refs when needed",
      category: "ui",
      complexity: "medium",
      benefits: ["Performance", "Declarative", "Predictable Updates"],
    },
    {
      id: "8",
      legacyFeature: "Scriptlets (<% %>)",
      reactEquivalent: "useEffect / Custom Hooks",
      description:
        "Embedded Java code replaced with React lifecycle hooks and custom hooks for logic",
      category: "state",
      complexity: "high",
      benefits: ["Separation of Concerns", "Testability", "Reusability"],
    },
  ];

  const improvements = [
    {
      icon: Gauge,
      title: "Faster Load Times",
      stat: "70%",
      description: "Reduction in initial page load with code splitting",
    },
    {
      icon: Box,
      title: "Modular Components",
      stat: "95%",
      description: "Component reusability across the application",
    },
    {
      icon: TrendingUp,
      title: "Developer Velocity",
      stat: "3x",
      description: "Faster feature development and iteration",
    },
    {
      icon: Users,
      title: "Better UX",
      stat: "85%",
      description: "Improvement in user satisfaction scores",
    },
  ];

  const summaryIcons = [Gauge, Box, TrendingUp, Users];

  const filteredMappings =
    migrationReportJson?.[0] ??
    featureMappings
      .filter((mapping) => {
        return selectedCategory === "all" ? true : mapping.category === selectedCategory;
      })
      .sort((a, b) => {
        if (sortBy === "complexity") {
          const complexityOrder = { low: 1, medium: 2, high: 3 };
          return complexityOrder[b.complexity] - complexityOrder[a.complexity];
        }
        return a.legacyFeature.localeCompare(b.legacyFeature);
      });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "low":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "medium":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "high":
        return "bg-rose-100 text-rose-700 border-rose-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "rendering":
        return Code2;
      case "state":
        return RefreshCw;
      case "routing":
        return ArrowRight;
      case "data":
        return Layers;
      case "ui":
        return Box;
      default:
        return Code2;
    }
  };

  // API Integration For Migration Process
  const GenerateZIP = async () => {
    try {
      setLoading(true);
      const zip = new JSZip();
      // Add each file to the ZIP
      projectJson?.files?.forEach((file: { name: string; content: string }) => {
        zip.file(file?.name, file?.content);
      });

      // Generate ZIP and trigger download
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(
        blob,
        `${analysisReportJson?.[0]?.project?.name ? analysisReportJson[0].project.name : "react-migration-project"}-Reactjs.zip`
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!projectJson) {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);
      return () => clearInterval(interval);
    } else {
      setProgress(100);
    }
  }, [projectJson]);

  if (!projectJson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex  justify-center">
        <div className="max-w-2xl mx-auto text-center pt-5">
          <h1 className="tracking-tight text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent pb-4">
            Legacy JSP to Modern React
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-7">
            A comprehensive guide mapping legacy JavaServer Pages features to
            their modern React equivalents.
          </p>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-foreground">
            Migrating your project...
          </h2>
          <p className="text-slate-600">
            Please wait while we prepare your migration data...
          </p>
        </div>
      </div>
    );
  }

  if (projectJson?.files[0]?.error) {
    navigate("/analysis")
    return
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 mx-auto px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <MigrationAnalysis ProjectJson={projectJson ?? []} />
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Code2 className="w-7 h-7 text-blue-600" />
              <h2 className="text-3xl font-bold text-slate-900">
                Feature Mapping Comparison
              </h2>
            </div>
          </div>
          <div className="space-y-4">
            {filteredMappings?.map((mapping) => {
              const CategoryIcon = getCategoryIcon(mapping.category);
              return (
                <div
                  key={mapping.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <CategoryIcon className="w-5 h-5 text-slate-600" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                            Legacy (JSP)
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {mapping.legacyFeature}
                          </h3>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-13">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getComplexityColor(
                            mapping.complexity
                          )}`}
                        >
                          {mapping.complexity.toUpperCase()} COMPLEXITY
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                          {mapping.category}
                        </span>
                      </div>
                    </div>

                    <div className="lg:col-span-1 flex items-center justify-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="lg:col-span-6 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Code2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">
                            Modern (React)
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {mapping.reactEquivalent}
                          </h3>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed ml-13">
                        {mapping.description}
                      </p>
                      <div className="flex flex-wrap gap-2 ml-13">
                        {mapping.benefits.map((benefit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        <section>
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-7 h-7 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">
              Summary of Improvements
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(migrationReportJson?.[1] || improvements).map(
              (improvement, index) => {
                const Icon = summaryIcons[index];
                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600">
                        {improvement.stat}
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {improvement.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {improvement.description}
                    </p>
                  </div>
                );
              }
            )}
          </div>

          {/* Code Preview Block  */}
          <div className="flex items-center gap-3 mb-6 mt-12">
            <ScanSearch className="w-7 h-7 text-blue-600" />
            <h2 className="text-3xl font-bold text-slate-900">Code Preview</h2>
          </div>
          <div className="h-[90vh] w-full p-4 mb-12">
            <FileExplorer files={files} />
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white shadow-lg">
            <div className="flex justify-between items-center gap-4">
              <h3 className="text-2xl font-bold mb-2">
                Migration finished. Download now.
              </h3>
              <button
                onClick={() => GenerateZIP()}
                disabled={loading}
                className={`w-full sm:w-auto ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-transparent"
                  } text-white px-8 py-4 rounded-xl border-2 border-white hover:bg-white hover:text-blue-600 transition-all font-semibold text-lg`}
              >
                {loading ? "Generating ZIP..." : "Download ZIP"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default MigrationUI;
