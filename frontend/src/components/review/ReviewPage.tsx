import React, { useState } from "react";
import {
  Check,
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileCode,
  Sparkles,
  AlertCircle,
  Loader2,
  Send,
  Download,
} from "lucide-react";
import BackButton from "../button/BackButton";

const ReviewPage = ({
  convertedFiles,
  onAcceptAll,
  onRejectFile,
  onRefineWithFeedback,
}: any) => {
  const [expandedFiles, setExpandedFiles] = useState(new Set([0]));
  const [comments, setComments] = useState<any>({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [refiningFiles, setRefiningFiles] = useState(new Set());

  // Download functions
  const downloadFile = (file: any) => {
    const blob = new Blob([file.content], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAllFiles = () => {
    convertedFiles.forEach((file: any) => {
      setTimeout(() => downloadFile(file), 100); // Small delay between downloads
    });
  };

  const toggleFileExpansion = (index: number) => {
    const newExpanded = new Set(expandedFiles);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFiles(newExpanded);
  };

  const toggleCommentBox = (fileIndex: number) => {
    setShowCommentBox((prev: any) => ({
      ...prev,
      [fileIndex]: !prev[fileIndex],
    }));
  };

  const handleCommentChange = (fileIndex: number, value: any) => {
    setComments((prev) => ({
      ...prev,
      [fileIndex]: value,
    }));
  };

  const handleRefineFile = async (fileIndex: number) => {
    const comment = comments[fileIndex];
    if (!comment || !comment.trim()) {
      alert("Please add a comment before refining");
      return;
    }

    setRefiningFiles((prev) => new Set(prev).add(fileIndex));

    try {
      await onRefineWithFeedback(fileIndex, comment);
      // Clear comment after successful refinement
      setComments((prev) => ({
        ...prev,
        [fileIndex]: "",
      }));
      setShowCommentBox((prev) => ({
        ...prev,
        [fileIndex]: false,
      }));
    } catch (error) {
      console.error("Refinement failed:", error);
      alert("Failed to refine the file. Please try again.");
    } finally {
      setRefiningFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileIndex);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FileCode className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">
              Review Converted Files
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Review the AI-generated conversions, add comments for improvements,
            and accept or reject changes
          </p>
        </div>
        <BackButton className="mb-2" />

        {/* Stats Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {convertedFiles.length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Total Files</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {convertedFiles.filter((f) => f.accepted).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">Accepted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {Object.keys(comments).filter((k) => comments[k]).length}
              </div>
              <div className="text-sm text-gray-600 mt-1">With Comments</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mb-8">
          <button
            onClick={downloadAllFiles}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download All Files
          </button>
          <button
            onClick={onAcceptAll}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            Accept All & Create Repository
          </button>
        </div>

        {/* Files List */}
        <div className="space-y-6">
          {convertedFiles.map((file: any, index:number) => {
            const isExpanded = expandedFiles.has(index);
            const hasComment = comments[index]?.trim();
            const isRefining = refiningFiles.has(index);

            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-all"
              >
                {/* File Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-white flex-1">
                      <FileCode className="w-6 h-6" />
                      <div>
                        <h3 className="font-semibold text-lg">{file.name}</h3>
                        <p className="text-blue-100 text-sm">
                          {file.originalName} → Modern React
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => downloadFile(file)}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                        title="Download this file"
                      >
                        <Download className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => toggleCommentBox(index)}
                        className={`p-2 rounded-lg transition-all ${hasComment
                          ? "bg-yellow-400 text-yellow-900"
                          : "bg-white/20 hover:bg-white/30 text-white"
                          }`}
                        title={hasComment ? "Has comments" : "Add comment"}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => toggleFileExpansion(index)}
                        className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="p-6">
                    {/* Comment Section */}
                    {showCommentBox[index] && (
                      <div className="mb-6 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                          <div>
                            <h4 className="font-semibold text-amber-900">
                              Request AI Refinement
                            </h4>
                            <p className="text-sm text-amber-700">
                              Describe what you'd like to improve or change in
                              this conversion
                            </p>
                          </div>
                        </div>

                        <textarea
                          value={comments[index] || ""}
                          onChange={(e) =>
                            handleCommentChange(index, e.target.value)
                          }
                          placeholder="Example: 'Please add error handling in the useEffect hook' or 'Can you optimize this by using useMemo?'"
                          className="w-full border-2 border-amber-300 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 min-h-[100px]"
                          disabled={isRefining}
                        />

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRefineFile(index)}
                            disabled={!hasComment || isRefining}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                          >
                            {isRefining ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                AI is refining...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                Refine with AI
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => toggleCommentBox(index)}
                            className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all"
                            disabled={isRefining}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Code Diff View */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                      {/* Original Code */}
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-red-50 px-4 py-2 border-b-2 border-red-200">
                          <h4 className="font-semibold text-red-800 flex items-center gap-2">
                            <X className="w-4 h-4" />
                            Original Code
                          </h4>
                        </div>
                        <div className="bg-gray-900 p-4 overflow-auto max-h-96">
                          <pre className="text-sm text-gray-300 font-mono">
                            <code>{file.originalContent}</code>
                          </pre>
                        </div>
                      </div>

                      {/* Converted Code */}
                      <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-green-50 px-4 py-2 border-b-2 border-green-200">
                          <h4 className="font-semibold text-green-800 flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Converted Code
                          </h4>
                        </div>
                        <div className="bg-gray-900 p-4 overflow-auto max-h-96">
                          <pre className="text-sm text-green-400 font-mono">
                            <code>{file.content}</code>
                          </pre>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={() => onRejectFile(index)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <X className="w-5 h-5" />
                        Reject This File
                      </button>

                      <button
                        onClick={() => {
                          // Close current and open next file
                          const nextIndex = index + 1;
                          const newExpanded = new Set(expandedFiles);
                          newExpanded.delete(index); // Close current

                          if (nextIndex < convertedFiles.length) {
                            newExpanded.add(nextIndex); // Open next
                            setExpandedFiles(newExpanded);
                          } else {
                            // Last file - show success message
                            setExpandedFiles(newExpanded);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }
                        }}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Check className="w-5 h-5" />
                        Accept & Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Action */}
        {/* <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 inline-block">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Ready to Proceed?
            </h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Once you're satisfied with all conversions, create a new
              repository with the modernized code
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={downloadAllFiles}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <Download className="w-6 h-6" />
                Download All Files
              </button>
              <button
                onClick={onAcceptAll}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-12 rounded-full text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
              >
                <Check className="w-6 h-6" />
                Create Repository with Converted Files
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default ReviewPage;
