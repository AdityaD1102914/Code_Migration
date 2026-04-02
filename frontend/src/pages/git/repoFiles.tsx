import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { traverseGitHubRepo } from "../../utils/react/githubHelpers";
import { reactAnalyzeCode } from "../../services/analysisReact";
import { angularAnalyzeCode } from "../../services/analysis_angular";
import { getToastPayloadFromAI, parseAIResult } from "../../utils/react/parseAIResult";
import { parseAngularAIResult } from "../../utils/angular-parse-AI-result";
import ReactResultsSection from "../../components/analysis/ResultSection";
import AngularResultsSection from "../../components/analysis/angular-result-section";
import { ChevronDown, ChevronUp, File, ArrowRight, Zap } from "lucide-react";
import { aiConversionFunction } from "../../services/migrationConversionProcess";
import { FRAMEWORK_CONFIG } from "../../utils/react/constants";
import useToaster from "../../hooks/useToaster"

type RepoFile = File & { path: string; content?: string };

interface FileContentDisplayProps {
  file: RepoFile;
}

const FileContentDisplay = ({ file }: FileContentDisplayProps) => {
  const [content, setContent] = useState<string>("Loading...");

  useEffect(() => {
    const loadContent = async () => {
      try {
        if (!file?.content) {
          const text = await file.text();
          setContent(text);
        } else {
          setContent(file.content);
        }
      } catch (error) {
        setContent("Error loading content");
      }
    };
    loadContent();
  }, [file]);

  return (
    <pre className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap overflow-auto max-h-96 py-4">
      {content}
    </pre>
  );
};

const RepoFiles = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const repo = searchParams.get("repo");
  const owner = searchParams.get("owner");
  const [files, setFiles] = useState<any[]>([]);
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const [isConverting, setIsCetconverting] = useState(false);
  const [isAnalyzComplete, setIsAnalyzComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedFileObjects, setSelectedFileObjects] = useState<any[]>([]);
  const { showSuccessToast, showErrorToast, showWarningToast } = useToaster();

  let GetTechnology = sessionStorage.getItem("selectedTech") ?? "react";

  //  function to get files from repo
  const fetchRepoFiles = async () => {
    setLoading(true);
    if (owner && repo) {
      const files = await traverseGitHubRepo(owner, repo);

      // check if proper file formate
      const config = FRAMEWORK_CONFIG[GetTechnology as keyof typeof FRAMEWORK_CONFIG];
      const relevantFiles = files.filter((file: any) =>
        config.extensions.some((ext: any) => file.name.endsWith(ext))
      );
      setFiles(relevantFiles);
      setLoading(false);
    } else {
      const stateFiles = location?.state?.files || [];
      console.log('Files from state:', stateFiles);
      setFiles(stateFiles);
      setLoading(false);
    }
  };

  const toggleAccordion = (path: string) => {
    setOpenItem(openItem === path ? null : path);
  };

  const toggleFileSelection = (path: string) => {
    const newSelectedFiles = new Set(selectedFiles);
    if (newSelectedFiles?.has(path)) {
      newSelectedFiles?.delete(path);
    } else {
      newSelectedFiles.add(path);
    }
    setSelectedFiles(newSelectedFiles);
  };

  const toggleSelectAll = () => {
    if (selectedFiles?.size === files?.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files?.map((file) => file?.path)));
    }
  };

  const startAnalysis = async () => {
    if (selectedFiles?.size === 0) {
      alert("Please select at least one file to analyze");
      return;
    }

    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      // Filter selected files
      const selectedFileObjects = [];
      for (const file of files) {
        if (selectedFiles.has(file.path)) {
          let text = file.content;
          if (!text) {
            text = await file.text();
          }
          selectedFileObjects.push({
            path: file.path,
            content: text
          });
        }
      }

      setSelectedFileObjects(selectedFileObjects);

      // Perform AI analysis
      if (GetTechnology === "react") {
        const resultText = await reactAnalyzeCode(selectedFileObjects);
        if (!resultText) throw new Error("AI returned empty response. Please check your API quota.");
        const structuredResult = parseAIResult(resultText);
        // hide start analysis button
        setIsAnalyzComplete(true);
        // Store result
        setAnalysisResult(structuredResult);
        showSuccessToast("Analysis report is ready!");

        // Redirect to React Results Page
        navigate("/react-analysis-result", {
          state: {
            analysisResult: structuredResult,
            selectedFiles: selectedFileObjects,
            repo,
            owner,
          },
        });

      } else {
        const resultText = await angularAnalyzeCode(selectedFileObjects);
        if (!resultText) throw new Error("AI returned empty response. Please check your API quota.");
        const structuredResult = parseAngularAIResult(resultText);
        // hide start analysis button
        setIsAnalyzComplete(true);
        // Store result
        setAnalysisResult(structuredResult);
        showSuccessToast("Analysis report is ready!");

         // Redirect to Angular Results Page
        navigate("/angular-analysis-result", {
          state: {
            analysisResult: structuredResult,
            selectedFiles: selectedFileObjects,
            repo,
            owner,
          },
        });

      }

    } catch (error) {
      console.log(error)
      showErrorToast("Failed to analyze selected files. Please check your API key or try again.")

    } finally {
      setAnalyzing(false);
    }
  };

  const startConversionMigration = async () => {
    try {
      if (selectedFiles?.size === 0) {
        alert("Please select at least one file to analyze");
        showWarningToast("Please select at least one file to analyze")
        return;
      }
      setIsCetconverting(true);

      // Filter selected files
      // this is for previous files to show
      // const selectedFileObjects = files.filter((file) =>
      //   selectedFiles.has(file.path)
      // );
      const selectedFileObjects = [];
      for (const file of files) {
        if (selectedFiles.has(file.path)) {
          let text = file.content;
          if (!text) {
            text = await file.text();
          }
          selectedFileObjects.push({
            path: file.path,
            content: text
          });
        }
      }

      // ai functionality for conversion migration
      const conversionResp = await aiConversionFunction(selectedFileObjects);

      setSelectedFileObjects(selectedFileObjects);
      showSuccessToast("Conversion result is ready!");
      navigate("/conversion-migration", {
        state: {
          previous: selectedFileObjects,
          updated: conversionResp || [],
        },
      });
      setIsCetconverting(false);
    } catch (error) {
      setIsCetconverting(false);
      console.log("error: ", error);
    }
  };

  useEffect(() => {
    fetchRepoFiles();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg">
              <File className="w-6 h-6 text-slate-700" />
            </div>
            <h1 className="text-4xl font-light text-slate-900 capitalize">
              {repo || "Directory"} Files
            </h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">
            Manage and select files from your {repo || "Directory"}
          </p>
        </div>

        {/* Select All Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
            <input
              type="checkbox"
              id="selectAll"
              checked={
                selectedFiles?.size === files?.length && files?.length > 0
              }
              onChange={toggleSelectAll}
              className="w-5 h-5 cursor-pointer accent-slate-600"
            />
            <label
              htmlFor="selectAll"
              className="text-slate-700 font-medium cursor-pointer flex-1"
            >
              Select All Files
            </label>
            <span className="text-slate-500 text-sm font-light">
              {selectedFiles?.size} of {files?.length} selected
            </span>
          </div>
        </div>

        {/* Accordion Items */}
        <div
          className={`space-y-2 mb-10 ${files?.length > 5 ? "h-85 overflow-y-scroll px-1" : ""
            } `}
        >
          {files?.length > 0 ? (
            files?.map((file) => (
              <div
                key={file?.path}
                className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200 hover:border-slate-300 hover:shadow-sm"
              >
                <button
                  onClick={() => toggleAccordion(file?.path)}
                  className="w-full text-left px-5 py-4 flex items-center gap-4 hover:bg-slate-50 transition-colors group"
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedFiles.has(file?.path)}
                    onChange={() => toggleFileSelection(file?.path)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 cursor-pointer accent-slate-600 flex-shrink-0"
                  />

                  {/* File Path */}
                  <span className="font-medium text-slate-800 flex-1 truncate">
                    {file?.path}
                  </span>

                  {/* Chevron Icon */}
                  <div className="flex-shrink-0">
                    {openItem === file?.path ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 transition-transform" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 transition-transform group-hover:text-slate-600" />
                    )}
                  </div>
                </button>

                {/* Accordion Content */}
                {openItem === file?.path && (
                  <div className="px-5 pb-4 bg-slate-50 border-t border-slate-200">
                    <FileContentDisplay file={file as RepoFile} />
                  </div>
                )}
              </div>
            ))
          ) : !loading ? (
            <p className="text-slate-500 text-sm">
              No files found in the repository.
            </p>
          ) : (
            <p className="text-center">Loading...</p>
          )}
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="mt-10">
            {/* Convert CTA - Show if there are class components */}
            {analysisResult?.classComponents > 0 && (
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div className="text-white">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Zap className="w-6 h-6" />
                      {analysisResult?.classComponents} Class Components
                      Detected
                    </h3>
                    <p className="text-indigo-100 mt-1">
                      Convert them to modern functional components with React
                      Hooks
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigate("/react-conversion", {
                        state: { filesToConvert: selectedFileObjects },
                      });
                    }}
                    className="bg-white text-indigo-600 py-3 px-6 rounded-lg font-bold hover:bg-indigo-50 transition flex items-center gap-2 shadow-lg"
                  >
                    Convert Components
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3  bg-white pt-6">
          <button
            onClick={startAnalysis}
            disabled={analyzing || isConverting}
            className={`flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${isAnalyzComplete ? "hidden" : ""
              }`}
          >
            {analyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>Start Analysis</>
            )}
          </button>
          <button
            onClick={startConversionMigration}
            disabled={isConverting || analyzing}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-xl transition-all duration-200 hover:shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isConverting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                Migrating...
              </>
            ) : (
              <>Start Migration</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepoFiles;
