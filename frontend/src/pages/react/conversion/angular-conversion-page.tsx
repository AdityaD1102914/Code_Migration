import React, { useState } from "react";
import {
  Upload,
  FileCode,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  Trash2,
} from "lucide-react";
import { convertToFunctional } from "../../../services/convertReactFile";

export default function AngularConversionPage() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [convertedCode, setConvertedCode] = useState(null);
  const [error, setError] = useState(null);

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    setFiles(uploadedFiles);
    setConvertedCode(null);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const convertFiles = async () => {
    if (files.length === 0) {
      setError("Please upload at least one file");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const converted = await convertToFunctional(files);
      setConvertedCode(converted);
    } catch (err) {
      console.error("Conversion error:", err);
      setError(err.message || "An error occurred during conversion");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (file) => {
    const blob = new Blob([file.content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    if (!convertedCode) return;
    convertedCode.forEach((file) => downloadFile(file));
  };

  const resetAll = () => {
    setFiles([]);
    setConvertedCode(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-3">
            ⚛️ React Component Converter
          </h1>
          <p className="text-lg text-gray-600">
            Transform class components into modern functional components with
            React Hooks
          </p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all">
            <input
              type="file"
              id="fileInput"
              multiple
              accept=".js,.jsx,.tsx,.ts"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer flex flex-col items-center"
            >
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <Upload className="w-12 h-12 text-indigo-600" />
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">
                Upload React Component Files
              </p>
              <p className="text-sm text-gray-500">
                Supports .js, .jsx, .tsx, .ts files • Multiple files allowed
              </p>
            </label>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">
                  Selected Files ({files.length})
                </h3>
                <button
                  onClick={resetAll}
                  className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
              <div className="space-y-2 mb-6">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <FileCode className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <span className="text-sm text-gray-800 flex-grow">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={convertFiles}
                disabled={isProcessing}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Converting Components...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    Convert to Modern React
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5 mb-6 flex items-start gap-3 shadow-md">
            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 text-lg">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Converted Code */}
        {convertedCode && convertedCode.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                ✅ Converted Components
              </h2>
              <button
                onClick={downloadAll}
                className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                Download All
              </button>
            </div>

            <div className="space-y-6">
              {convertedCode.map((file, index) => (
                <div
                  key={index}
                  className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-indigo-300 transition-colors"
                >
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-5 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white">
                      <FileCode className="w-5 h-5" />
                      <span className="font-semibold">{file.name}</span>
                    </div>
                    <button
                      onClick={() => downloadFile(file)}
                      className="bg-white text-indigo-600 py-2 px-4 rounded font-medium hover:bg-indigo-50 transition-colors flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="bg-gray-900 p-6 overflow-auto max-h-96">
                    <pre className="text-sm text-green-400 font-mono">
                      <code>{file.content}</code>
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        {!error && files.length === 0 && (
          <div className="text-center mt-12 text-gray-500">
            <p className="text-lg">
              Upload your React class components to get started 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
