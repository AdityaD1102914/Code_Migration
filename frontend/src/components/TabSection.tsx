import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import {
  Upload,
  GitBranch,
  FileCode,
  RefreshCw,
  Sparkles,
  Link,
  Package,
  FolderOpen,
  X,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Zap,
  Archive,
} from "lucide-react";
import { reactAnalyzeCode } from "../services/analysisReact";
import { parseAIResult } from "../utils/react/parseAIResult";
import {
  getPhaseIcon,
  getPhaseColor,
  getColorClasses,
} from "../utils/react/phaseUtils";
import { connectToGit } from "../services/git.service";
import GitConnect from "../pages/git/GitConnect";
import { useApi } from "@/LegacyLift/services/useApi";
import ResultsSection from "./analysisResultUi";
import { FRAMEWORK_CONFIG } from "../utils/react/constants";
import useToaster from "../hooks/useToaster"



const shouldProcessFile = (fullPath: string, framework: string) => {
  const config = FRAMEWORK_CONFIG[framework];
  return (
    config.extensions.some((ext: string) => fullPath.endsWith(ext)) ||
    config.specialFiles.some(
      (file: string) => fullPath.split("/").pop() === file
    )
  );
};

const shouldIgnoreDirectory = (dirPath: string) => {
  const ignored = ["node_modules/", ".git/", "dist/", "build/", "coverage/"];
  return ignored.some((ignoredDir) => dirPath.includes(ignoredDir));
};

const filterRelevantFiles = (files: File[], framework: string) => {
  return files.filter((file: any) => {
    const path = file?.path || file.webkitRelativePath || file.name;
    return shouldProcessFile(path, framework);
  });
};

const getFileStatistics = (files: File[], framework: string) => {
  const config = FRAMEWORK_CONFIG[framework];
  const stats: any = {};
  config.extensions.forEach((ext: string) => (stats[ext.replace(".", "")] = 0));
  config.specialFiles.forEach((file: any) => (stats[file] = 0));

  files.forEach((file) => {
    const name = file.name;
    if (config.specialFiles.includes(name)) {
      stats[name] += 1;
    } else {
      const ext = "." + name.split(".").pop();
      if (config.extensions.includes(ext)) {
        const key = ext.replace(".", "");
        stats[key] = (stats[key] || 0) + 1;
      }
    }
  });

  return stats;
};

// ============ Main TabSection Component ============
const TabSection = ({
  framework = "react",
  onAnalysisComplete,
  handleGithubRepo,
  githubFiles,
}: any) => {
  const config = FRAMEWORK_CONFIG[framework];
  const navigate = useNavigate();
  const { apiCall } = useApi();

  // --- Internal state ---
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [originalZipFile, setOriginalZipFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  const [fetchingRepo, setFetchingRepo] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { showSuccessToast, showErrorToast, showWarningToast } = useToaster();

  // Track if we've already analyzed the current githubFiles
  const [analyzedGithubFiles, setAnalyzedGithubFiles] = useState(null);

  // **** JSP Related States ****
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // --- Effect to analyze GitHub files when received ---
  useEffect(() => {
    const analyzeGithubFiles = async () => {
      // Only analyze if we have new files that haven't been analyzed yet
      if (
        githubFiles &&
        githubFiles.length > 0 &&
        githubFiles !== analyzedGithubFiles &&
        !analyzing
      ) {
        // Mark these files as being analyzed
        setAnalyzedGithubFiles(githubFiles);
        setFetchingRepo(false);
        setAnalyzing(true);

        try {
          // Convert GitHub response to File-like objects for reactAnalyzeCode
          const files = githubFiles.map((file: any) => {
            const blob = new Blob([file.content || ""], { type: "text/plain" });
            const fileObj: any = new File([blob], file.name, {
              type: "text/plain",
            });
            fileObj.path = file.path;
            return fileObj;
          });

          const filteredFiles = filterRelevantFiles(files, framework);
          setUploadedFiles(filteredFiles);

          // Perform AI analysis
          const resultText = await reactAnalyzeCode(filteredFiles, framework);
          const structuredResult = parseAIResult(resultText, framework);

          // Store result locally
          setAnalysisResult(structuredResult);

          // Call parent callback
          if (onAnalysisComplete) {
            onAnalysisComplete(structuredResult, filteredFiles, framework);
          }
        } catch (error) {
          console.error("GitHub analysis failed:", error);
          alert("Failed to analyze GitHub repository. Please try again.");
        } finally {
          setAnalyzing(false);
        }
      }
    };

    analyzeGithubFiles();
  }, [githubFiles]);

  // --- Analysis Handlers ---
  const analyzeWithAI = async () => {
    // Guard: must have files
    if (!uploadedFiles || uploadedFiles.length === 0) {
      if (framework === 'jsp') {
        showWarningToast("Please upload a ZIP file first.")
      }
      return;
    }

    setAnalyzing(true);

    try {
      if (framework === 'jsp') {
        // 👉 JSP path: build a ZIP and hit the Analysis API, then go to /analysis
        const zip = new JSZip();

        // Add each file to ZIP
        for (const file of uploadedFiles) {
          const content = await file.text();
          const filePath = file.path || file.name; // preserve path if present
          zip.file(filePath, content ?? "");
        }

        // Create zip blob
        const zipBlob = await zip.generateAsync({ type: "blob" });

        // Prepare form data
        const formData = new FormData();
        formData.append("folder", zipBlob, "files.zip");
        formData.append("filterZip", "true");

        // Call API
        const response = await apiCall({
          method: "POST",
          url: "/analyze-project",
          data: formData,
          headers: { "Content-Type": "multipart/form-data" },
        });

        const ok = response?.data?.status === 200 && !response?.data?.report?.[0]?.error;

        if (ok) {
          const report = response?.data?.report ?? [];
          // Store & navigate to analysis page
          setAnalysisResult(report);
          setAnalyzing(false);

          navigate("/analysis", {
            state: { analysisAPIData: report },
          });

          showSuccessToast("Your Analysis Report is Ready.")
          onAnalysisComplete?.(report, uploadedFiles, framework);
        } else {
          setAnalyzing(false);
          showErrorToast("AI Service Analysis Failed during ZIP analysis. Please Try Again.")
        }
      } else {
        // 👉 React/Angular path: go to repo-files first, then run client-side AI analysis
        if (uploadedFiles.length === 0) return;

        const filesData = await Promise.all(
          uploadedFiles.map(async (file) => ({
            path: file?.path || file?.name,
            content: await file.text(),
          }))
        );

        navigate("/repos-files", {
          state: { files: filesData },
        });
      }
    } catch (error) {
      console.error("analyzeWithAI error:", error);
      if (framework === 'jsp') {
        showErrorToast("Analysis Failed. Please Try Again.")
      } else {
        alert("Failed to analyze with AI. Please check your API key or try again.");
      }
      setAnalyzing(false);
    }
  }

  const analyzeGitHubRepo = async () => {
    if (!repoUrl.trim()) {
      alert("Please enter a GitHub repository URL");
      return;
    }

    const githubPattern = /github\.com\/([\w-]+)\/([\w-]+)/;
    const match = repoUrl.match(githubPattern);

    if (!match) {
      alert("Please enter a valid GitHub repository URL");
      return;
    }

    const owner = match[1];
    const repo = match[2].replace(/\.git$/, "");

    setFetchingRepo(true);
    // Clear previous results when starting new analysis
    setAnalysisResult(null);
    setAnalyzedGithubFiles(null);
    handleGithubRepo(owner, repo, "");
  };

  // --- File Handling ---
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const items = e.dataTransfer.items;
    const files = [];

    if (items?.[0]?.webkitGetAsEntry) {
      const entries = [];
      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
      }
      const promises = entries.map((entry) =>
        traverseFileTree(entry, files, "")
      );
      await Promise.all(promises);
      handleFiles(files);
    } else {
      handleFiles([...e.dataTransfer.files]);
    }
  };

  const traverseFileTree = (item, files, path = "") => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          const fullPath = path + file.name;
          if (shouldProcessFile(fullPath, framework)) {
            file.path = fullPath;
            files.push(file);
          }
          resolve();
        });
      } else if (item.isDirectory) {
        const dirName = item.name;
        const dirPath = path + dirName + "/";
        if (shouldIgnoreDirectory(dirPath)) {
          resolve();
          return;
        }
        const dirReader = item.createReader();
        const readEntries = () => {
          dirReader.readEntries((entries) => {
            if (entries.length === 0) {
              resolve();
              return;
            }
            const promises = entries.map((entry) =>
              traverseFileTree(entry, files, dirPath)
            );
            Promise.all(promises).then(readEntries);
          });
        };
        readEntries();
      } else {
        resolve();
      }
    });
  };

  const handleFiles = (files) => {
    const relevantFiles = filterRelevantFiles(files, framework);

    // React Project Validation
    // if (framework === 'react' && !relevantFiles.some(file => file.name.endsWith('.tsx'))) {
    //   showWarningToast("Invalid React Project,Please upload a different project.")
    //   return;
    // }

    // Additional validation for Angular: must contain angular.json
    // if (framework === 'angular' && !relevantFiles.some(file => file.name === 'angular.json')) {
    //   showWarningToast("Invalid Angular Project,Please upload a different project.")
    //   return;
    // }

    setUploadedFiles(relevantFiles);
    // Clear previous results when new files are uploaded
    setAnalysisResult(null);
  };

  const handleFileInput = (e) => handleFiles([...e.target.files]);
  const handleDirectoryInput = (e) => {
    const filesWithPath = [...e.target.files].map((file) => {
      if (file.webkitRelativePath) file.path = file.webkitRelativePath;
      return file;
    });
    handleFiles(filesWithPath);
  };

  const removeFile = (index) =>
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

  const clearAllFiles = () => {
    setUploadedFiles([]);
    setOriginalZipFile(null);
    setAnalysisResult(null);
  };

  // --- Derived data ---
  const fileStats = getFileStatistics(uploadedFiles, framework);

  //******* Jsp Related Handlers */ 
  const handleZipInput = async (e) => {
    const zipFile = e.target.files[0];
    // allow re-selecting the same file later
    e.target.value = "";

    if (!zipFile) {
      setErrorText("No file selected.");
      return;
    }

    // Basic ZIP extension check
    if (!zipFile.name.toLowerCase().endsWith(".zip")) {
      const msg = "Please upload a .zip file.";
      setErrorText(msg);
      toast({
        variant: "destructive",
        title: "Invalid file",
        description: "Only .zip files are supported.",
      });
      return;
    }

    try {
      // Keep the original ZIP for backend upload
      setOriginalZipFile(zipFile);

      // Load ZIP contents
      const zip = await JSZip.loadAsync(zipFile);

      // 💡 JSP presence gate (fail fast)
      const jspCount = Object.values(zip.files).filter(
        (entry) => !entry.dir && entry.name.toLowerCase().endsWith(".jsp")
      ).length;

      if (framework === "jsp" && jspCount === 0) {
        showWarningToast("Unsupported ZIP,This ZIP does not contain any .jsp files.")
        setUploadedFiles([]); // clear any previews
        return; // ⛔️ do NOT extract; do NOT call API
      }

      // ✅ Clear previous errors if valid ZIP and JSPs exist
      setErrorText(null);

      // Extract for UI preview
      const extractedFiles = [];
      const filePromises = [];

      zip.forEach((relativePath, zipEntry) => {
        // Skip directories and ignored directories
        if (zipEntry.dir || shouldIgnoreDirectory(relativePath)) return;

        // Only include allowed extensions for the chosen framework
        if (shouldProcessFile(relativePath, framework)) {
          const p = zipEntry.async("blob").then((blob) => {
            const file = new File([blob], zipEntry.name, {
              type: blob.type || "application/octet-stream",
            });
            // Add path property for display
            file.path = relativePath;
            extractedFiles.push(file);
          });
          filePromises.push(p);
        }
      });

      await Promise.all(filePromises);
      setUploadedFiles(extractedFiles);
      setAnalysisResult(null);

      // If needed, call backend after gate passes:
      // await handleFileUpload([zipFile]);
    } catch (error) {
      console.error("Error extracting ZIP file:", error);
      const msg = "Failed to extract ZIP file. Please make sure it is a valid ZIP archive.";
      setErrorText(msg);
      toast({
        variant: "destructive",
        title: "Extraction failed",
        description: "Could not read ZIP. Please try another file.",
      });
    }
  };

  // --- Helpers ---
  const shouldIgnoreDirectory = (relativePath: string) => {
    const p = relativePath.toLowerCase();
    return (
      p.startsWith("__macosx") ||
      p.includes("/node_modules/") ||
      p.includes("/.git/")
    );
  };

  const shouldProcessFile = (relativePath: string, fw: string) => {
    const name = relativePath.toLowerCase();
    if (fw === "jsp") {
      return (
        name.endsWith(".jsp") ||
        name.endsWith(".js") ||
        name.endsWith(".css") ||
        name.endsWith(".html") ||
        name.endsWith(".xml") ||
        name.endsWith(".properties")
      );
    }
    return true;
  };

  // --- Drag & drop (delegates to input handler) ---
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    e.dataTransfer.dropEffect = "copy";
  };
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (!file) {
      setErrorText("No file detected. Try dropping the ZIP again.");
      return;
    }

    // Reuse input handler logic with synthetic event
    const syntheticEvent = {
      target: { files: [file], value: "" },
    } as unknown as React.ChangeEvent<HTMLInputElement>;
    await handleZipInput(syntheticEvent);
  };

  // --- Render ---
  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center px-6 py-3 font-medium cursor-pointer transition-colors ${activeTab === "upload"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Project
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`flex items-center px-6 py-3 font-medium cursor-pointer transition-colors ${activeTab === "github"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
              }`}
          >
            <GitBranch className="w-5 h-5 mr-2" />
            GitHub Repository
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {config.uploadTitle}
            </h3>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition ${dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
                }`}
            >
              {/* Final Test */}
              {config.zipOnly ? (
                <>
                  <div
                    className={`rounded-xl border-dashed p-8 transition-colors ${isDragging ? "border-purple-600 bg-purple-50" : "border-gray-300 bg-white"
                      }`}
                    onDragOver={onDragOver}
                    onDragEnter={onDragEnter}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                  >
                    <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-700 mb-2">
                      {isDragging
                        ? "Release to upload your ZIP"
                        : "Drag and drop your project ZIP file here"}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Or click below to browse for your ZIP file
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-semibold">
                        .zip
                      </span>
                    </div>

                    <input
                      ref={inputRef}
                      type="file"
                      accept=".zip"
                      onChange={handleZipInput}
                      className="hidden"
                      id="zip-upload"
                    />

                    <div className="flex gap-3 justify-center">
                      <label
                        htmlFor="zip-upload"
                        className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-purple-700 hover:to-pink-700 transition"
                      >
                        <Archive className="w-5 h-5 mr-2" />
                        Choose ZIP Folder
                      </label>
                    </div>


                    {errorText && (
                      <p className="mt-4 text-sm text-red-600" role="alert" aria-live="assertive">
                        {errorText}
                      </p>
                    )}


                    {loading && (
                      <p className="mt-4 text-sm text-gray-600" role="status">
                        Uploading &amp; analyzing ZIP…
                      </p>
                    )}
                  </div>
                </>
              )
                : (
                  // React/Angular - Regular upload
                  <>
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-700 mb-2">
                      Drag and drop your project folder here
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Or click below to browse for your project folder
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 mb-6">
                      {config.extensions.map((ext: string) => (
                        <span
                          key={ext}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                        >
                          {ext}
                        </span>
                      ))}
                      {config.specialFiles.map((file: string) => (
                        <span
                          key={file}
                          className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-semibold"
                        >
                          {file}
                        </span>
                      ))}
                    </div>

                    <input
                      type="file"
                      multiple
                      accept={config.acceptAttr}
                      onChange={handleFileInput}
                      className="hidden"
                      id="file-upload"
                    />
                    <input
                      type="file"
                      webkitdirectory=""
                      directory=""
                      multiple
                      onChange={handleDirectoryInput}
                      className="hidden"
                      id="folder-upload"
                    />
                    <div className="flex gap-3 justify-center">
                      <label
                        htmlFor="file-upload"
                        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-blue-700 hover:to-purple-700 transition"
                      >
                        <FileCode className="w-5 h-5 mr-2" />
                        Choose Files
                      </label>
                      <label
                        htmlFor="folder-upload"
                        className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg cursor-pointer hover:from-purple-700 hover:to-pink-700 transition"
                      >
                        <FolderOpen className="w-5 h-5 mr-2" />
                        Choose Folder
                      </label>
                    </div>
                  </>
                )}
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <button
                    onClick={clearAllFiles}
                    className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear All
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                  {config.specialFiles.map((file) => {
                    const count = fileStats[file] || 0;
                    if (count === 0) return null;
                    const isPackage = file === "package.json";
                    return (
                      <div
                        key={file}
                        className={`${isPackage
                          ? "bg-green-50 border-green-200"
                          : "bg-purple-50 border-purple-200"
                          } border rounded p-2 text-center`}
                      >
                        <Package
                          className={`w-4 h-4 mx-auto mb-1 ${isPackage ? "text-green-600" : "text-purple-600"
                            }`}
                        />
                        <p className="text-xs text-gray-600">{file}</p>
                        <p
                          className={`text-sm font-semibold ${isPackage ? "text-green-700" : "text-purple-700"
                            }`}
                        >
                          {count}
                        </p>
                      </div>
                    );
                  })}
                  {config.extensions.map((ext) => {
                    const key = ext.replace(".", "");
                    const count = fileStats[key] || 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={ext}
                        className="bg-blue-50 border border-blue-200 rounded p-2 text-center"
                      >
                        <FileCode className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">{ext}</p>
                        <p className="text-sm font-semibold text-blue-700">
                          {count}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
                  {uploadedFiles.map((file, idx) => {
                    const isSpecial = config.specialFiles.includes(file.name);
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between text-sm p-2 rounded group hover:shadow-sm transition ${isSpecial
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-white text-gray-700 border border-gray-200"
                          }`}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          {isSpecial ? (
                            <Package className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                          ) : (
                            <FileCode className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
                          )}
                          <span className="truncate">
                            {file.path || file.webkitRelativePath || file.name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition flex-shrink-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={analyzeWithAI}
                  disabled={analyzing || uploadedFiles.length === 0}
                  className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Moving... {config.name} Project...
                    </>
                  ) : (
                    <>
                      {/* <Sparkles className="w-5 h-5 mr-2" /> */}
                      Next Step
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* GitHub Tab */}
        {activeTab === "github" && (
          // <div>
          //   <div className="text-center max-w-2xl mx-auto">
          //     <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
          //       <GitBranch className="w-12 h-12 text-white" />
          //     </div>

          //     <h3 className="text-2xl font-bold text-gray-900 mb-3">
          //       Analyze GitHub Repository
          //     </h3>
          //     <p className="text-gray-600 mb-4">{config.githubDescription}</p>
          //     <p className="text-sm text-gray-500 mb-8">{config.githubNote}</p>

          //     <div className="mb-6">
          //       <div className="relative">
          //         <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          //         <input
          //           type="text"
          //           value={repoUrl}
          //           onChange={(e) => setRepoUrl(e.target.value)}
          //           onKeyPress={(e) =>
          //             e.key === "Enter" &&
          //             !fetchingRepo &&
          //             !analyzing &&
          //             repoUrl.trim() &&
          //             analyzeGitHubRepo()
          //           }
          //           placeholder="https://github.com/username/repository"
          //           className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition"
          //           disabled={fetchingRepo || analyzing}
          //         />
          //       </div>
          //     </div>

          //     <div className="flex-1 flex justify-center">
          //       <button
          //         onClick={analyzeGitHubRepo}
          //         disabled={analyzing || fetchingRepo || !repoUrl.trim()}
          //         className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:from-gray-900 hover:to-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          //       >
          //         {fetchingRepo ? (
          //           <>
          //             <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          //             Fetching Repository Files...
          //           </>
          //         ) : analyzing ? (
          //           <>
          //             <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
          //             Analyzing Repository...
          //           </>
          //         ) : (
          //           <>
          //             <GitBranch className="w-5 h-5 mr-2" />
          //             Analyze Repository
          //           </>
          //         )}
          //       </button>
          //       {/* The New Buton added to conndect git directly without giving url */}
          //       {/* It will be moved to OR section of input for gitURL */}
          //       <button className="bg-gradient-to-r from-gray-800
          //        to-gray-900 text-white px-8 py-4
          //        rounded-lg font-semibold hover:from-gray-900
          //         hover:to-black transition flex items-center
          //          justify-center ml-2"
          //         onClick={analyzeGitHubRepo}
          //       >
          //         Connect To Git
          //       </button>
          //     </div>

          //     {/* Show fetched files summary */}
          //     {uploadedFiles.length > 0 && activeTab === "github" && (
          //       <div className="mt-8 text-left">
          //         <div className="flex items-center justify-between mb-4">
          //           <h4 className="text-lg font-semibold text-gray-900">
          //             Repository Files ({uploadedFiles.length})
          //           </h4>
          //         </div>

          //         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
          //           {config.specialFiles.map((file) => {
          //             const count = fileStats[file] || 0;
          //             if (count === 0) return null;
          //             const isPackage = file === "package.json";
          //             return (
          //               <div
          //                 key={file}
          //                 className={`${isPackage
          //                   ? "bg-green-50 border-green-200"
          //                   : "bg-purple-50 border-purple-200"
          //                   } border rounded p-2 text-center`}
          //               >
          //                 <Package
          //                   className={`w-4 h-4 mx-auto mb-1 ${isPackage ? "text-green-600" : "text-purple-600"
          //                     }`}
          //                 />
          //                 <p className="text-xs text-gray-600">{file}</p>
          //                 <p
          //                   className={`text-sm font-semibold ${isPackage ? "text-green-700" : "text-purple-700"
          //                     }`}
          //                 >
          //                   {count}
          //                 </p>
          //               </div>
          //             );
          //           })}
          //           {config.extensions.map((ext) => {
          //             const key = ext.replace(".", "");
          //             const count = fileStats[key] || 0;
          //             if (count === 0) return null;
          //             return (
          //               <div
          //                 key={ext}
          //                 className="bg-blue-50 border border-blue-200 rounded p-2 text-center"
          //               >
          //                 <FileCode className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          //                 <p className="text-xs text-gray-600">{ext}</p>
          //                 <p className="text-sm font-semibold text-blue-700">
          //                   {count}
          //                 </p>
          //               </div>
          //             );
          //           })}
          //         </div>

          //         <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
          //           {uploadedFiles.map((file, idx) => {
          //             const isSpecial = config.specialFiles.includes(file.name);
          //             return (
          //               <div
          //                 key={idx}
          //                 className={`flex items-center text-sm p-2 rounded transition ${isSpecial
          //                   ? "bg-green-50 border border-green-200 text-green-800"
          //                   : "bg-white text-gray-700 border border-gray-200"
          //                   }`}
          //               >
          //                 <div className="flex items-center min-w-0 flex-1">
          //                   {isSpecial ? (
          //                     <Package className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
          //                   ) : (
          //                     <FileCode className="w-4 h-4 mr-2 flex-shrink-0 text-blue-600" />
          //                   )}
          //                   <span className="truncate">
          //                     {file.path ||
          //                       file.webkitRelativePath ||
          //                       file.name}
          //                   </span>
          //                 </div>
          //               </div>
          //             );
          //           })}
          //         </div>
          //       </div>
          //     )}

          //     <p className="text-sm text-gray-500 mt-6">
          //       Make sure the repository is public or you have access to it
          //     </p>
          //   </div>
          // </div>
          <GitConnect />
        )}
      </div>

      {/* Results Section - Shows after analysis is complete */}
      {/* {analysisResult && (
        <ResultsSection
          analysisResult={analysisResult}
          hasClassComponents={analysisResult.classComponents > 0}
          onConvert={() => {
            // Navigate to conversion page with the uploaded files
            navigate("/react-conversion", {
              state: { filesToConvert: uploadedFiles },
            });
          }}
        />
      )} */}
    </>
  );
};

export default TabSection;
