import { useState } from "react";
import {
  Upload,
  GitBranch,
  FileCode,
  RefreshCw,
  Sparkles,
  Link,
  Package,
  CheckCircle2,
  FolderOpen,
  X,
  Trash2,
} from "lucide-react";
import {
  shouldProcessFile,
  shouldIgnoreDirectory,
  filterRelevantFiles,
  getFileStatistics,
  hasPackageJson,
  addPathToFile,
  RELEVANT_EXTENSIONS,
  IGNORED_DIRS,
} from "../../utils/react/fileFilterUtils";

const TabSection = ({
  activeTab,
  setActiveTab,
  uploadedFiles,
  setUploadedFiles,
  analyzing,
  analyzeWithAI,
  repoUrl,
  setRepoUrl,
  fetchingRepo,
  analyzeGitHubRepo,
}) => {
  const [dragActive, setDragActive] = useState(false);

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

    if (items && items[0].webkitGetAsEntry) {
      const files = [];
      const entries = [];

      for (let i = 0; i < items.length; i++) {
        const entry = items[i].webkitGetAsEntry();
        if (entry) entries.push(entry);
      }

      for (const entry of entries) {
        await traverseFileTree(entry, files);
      }

      handleFiles(files);
    } else {
      const files = [...e.dataTransfer.files];
      handleFiles(files);
    }
  };

  const traverseFileTree = (item, files, path = "") => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          const fullPath = path + file.name;

          // Check if file should be processed
          if (shouldProcessFile(fullPath)) {
            addPathToFile(file, fullPath);
            files.push(file);
          }
          resolve();
        });
      } else if (item.isDirectory) {
        const dirName = item.name;
        const dirPath = path + dirName + "/";

        // Skip ignored directories
        if (shouldIgnoreDirectory(dirPath)) {
          resolve();
          return;
        }

        const dirReader = item.createReader();

        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
              return;
            }

            for (const entry of entries) {
              await traverseFileTree(entry, files, dirPath);
            }

            readEntries();
          });
        };
        readEntries();
      } else {
        resolve();
      }
    });
  };

  const handleFiles = (files) => {
    const relevantFiles = filterRelevantFiles(files);
    setUploadedFiles(relevantFiles);
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleDirectoryInput = (e) => {
    const files = [...e.target.files];

    // Add webkitRelativePath as path for better display
    const filesWithPath = files.map((file) => {
      if (file.webkitRelativePath && !file.path) {
        addPathToFile(file, file.webkitRelativePath);
      }
      return file;
    });

    handleFiles(filesWithPath);
  };

  // Remove a specific file
  const removeFile = (indexToRemove) => {
    setUploadedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
  };

  // Clear all files
  const clearAllFiles = () => {
    setUploadedFiles([]);
  };

  // Get file statistics
  const fileStats = getFileStatistics(uploadedFiles);
  const hasPackageJsonFile = hasPackageJson(uploadedFiles);

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-8">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("upload")}
          className={`flex items-center px-6 py-3 font-medium transition-colors ${
            activeTab === "upload"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Upload className="w-5 h-5 mr-2" />
          Upload Project
        </button>
        <button
          onClick={() => setActiveTab("github")}
          className={`flex items-center px-6 py-3 font-medium transition-colors ${
            activeTab === "github"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <GitBranch className="w-5 h-5 mr-2" />
          GitHub Repository
        </button>
      </div>

      {/* Upload Tab Content */}
      {activeTab === "upload" && (
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Upload Your Entire React Project
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-2">
              Drag and drop your project folder here
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Or click below to browse for your project folder
            </p>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {RELEVANT_EXTENSIONS.map((ext) => (
                <span
                  key={ext}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                >
                  {ext}
                </span>
              ))}
              <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-semibold">
                package.json
              </span>
            </div>

            <input
              type="file"
              multiple
              accept=".js,.jsx,.tsx,.ts,.json"
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
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              {/* File Statistics */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                <button
                  onClick={clearAllFiles}
                  className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium transition"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {fileStats.packageJson > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
                    <Package className="w-4 h-4 text-green-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">package.json</p>
                    <p className="text-sm font-semibold text-green-700">
                      {fileStats.packageJson}
                    </p>
                  </div>
                )}
                {fileStats.jsx > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                    <FileCode className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">.jsx</p>
                    <p className="text-sm font-semibold text-blue-700">
                      {fileStats.jsx}
                    </p>
                  </div>
                )}
                {fileStats.js > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
                    <FileCode className="w-4 h-4 text-yellow-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">.js</p>
                    <p className="text-sm font-semibold text-yellow-700">
                      {fileStats.js}
                    </p>
                  </div>
                )}
                {fileStats.tsx > 0 && (
                  <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
                    <FileCode className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">.tsx</p>
                    <p className="text-sm font-semibold text-purple-700">
                      {fileStats.tsx}
                    </p>
                  </div>
                )}
                {fileStats.ts > 0 && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded p-2 text-center">
                    <FileCode className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                    <p className="text-xs text-gray-600">.ts</p>
                    <p className="text-sm font-semibold text-indigo-700">
                      {fileStats.ts}
                    </p>
                  </div>
                )}
              </div>

              {/* File List with Remove Buttons */}
              <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-50 rounded-lg p-3">
                {uploadedFiles.map((file, idx) => {
                  const isPackageJson = file.name === "package.json";
                  return (
                    <div
                      key={idx}
                      className={`flex items-center justify-between text-sm p-2 rounded group hover:shadow-sm transition ${
                        isPackageJson
                          ? "bg-green-50 border border-green-200 text-green-800"
                          : "bg-white text-gray-700 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-center min-w-0 flex-1">
                        {isPackageJson ? (
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
                        className="ml-2 p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-600 transition flex-shrink-0 opacity-0 group-hover:opacity-100"
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
                disabled={analyzing}
                className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Project...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* GitHub Tab Content */}
      {activeTab === "github" && (
        <div>
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <GitBranch className="w-12 h-12 text-white" />
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Analyze GitHub Repository
            </h3>
            <p className="text-gray-600 mb-4">
              Enter a GitHub repository URL to analyze your React project
            </p>
            <p className="text-sm text-gray-500 mb-8">
              We'll fetch all relevant files including package.json for complete
              analysis
            </p>

            <div className="mb-6">
              <div className="relative">
                <Link className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !fetchingRepo &&
                    !analyzing &&
                    repoUrl.trim() &&
                    analyzeGitHubRepo()
                  }
                  placeholder="https://github.com/username/repository"
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-blue-500 transition"
                  disabled={fetchingRepo || analyzing}
                />
              </div>
            </div>

            <button
              onClick={analyzeGitHubRepo}
              disabled={analyzing || fetchingRepo || !repoUrl.trim()}
              className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-4 rounded-lg font-semibold hover:from-gray-900 hover:to-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
            >
              {fetchingRepo ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Fetching Repository Files...
                </>
              ) : analyzing ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing Repository
                </>
              ) : (
                <>
                  <GitBranch className="w-5 h-5 mr-2" />
                  Analyze Repository
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Make sure the repository is public or you have access to it
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabSection;
