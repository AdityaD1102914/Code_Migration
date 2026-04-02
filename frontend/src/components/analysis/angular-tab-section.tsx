import { useState } from "react";
import {
  Upload,
  GitBranch,
  FileCode,
  RefreshCw,
  Sparkles,
  Link,
} from "lucide-react";

const AngularTabSection = ({
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

  const traverseFileTree = (item, files) => {
    return new Promise((resolve) => {
      if (item.isFile) {
        item.file((file) => {
          files.push(file);
          resolve();
        });
      } else if (item.isDirectory) {
        const dirReader = item.createReader();
        const readEntries = () => {
          dirReader.readEntries(async (entries) => {
            if (entries.length === 0) {
              resolve();
              return;
            }

            for (const entry of entries) {
              await traverseFileTree(entry, files);
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
    const jsFiles = files.filter(
      (file) =>
        file.name.endsWith(".js") ||
        file.name.endsWith(".css") ||
        file.name.endsWith(".html") ||
        file.name.endsWith(".ts") ||
        file.name.endsWith(".json")
    );
    setUploadedFiles(jsFiles);
  };

  const handleFileInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

  const handleDirectoryInput = (e) => {
    const files = [...e.target.files];
    handleFiles(files);
  };

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
          Upload Files
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
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Upload Your Legacy Project
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
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-700 mb-2">
              Drag and drop your project files or click to browse
            </p>
            <p className="text-sm text-gray-500 mb-4">Supported file types:</p>
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {[".js", ".html", ".ts", ".css", ".json"].map((ext) => (
                <span
                  key={ext}
                  className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                >
                  {ext}
                </span>
              ))}
            </div>
            <input
              type="file"
              multiple
              accept=".js,.html,.css,.ts,.json"
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
                <Upload className="w-5 h-5 mr-2" />
                Choose Folder
              </label>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="mt-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Uploaded Files ({uploadedFiles.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center text-sm text-gray-600 bg-gray-50 p-2 rounded"
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    {file.path || file.name}
                  </div>
                ))}
              </div>
              <button
                onClick={analyzeWithAI}
                disabled={analyzing}
                className="mt-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze with AI
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
            <p className="text-gray-600 mb-8">
              Enter a GitHub repository URL to analyze your legacy project
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

export default AngularTabSection;
