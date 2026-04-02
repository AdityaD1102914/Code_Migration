import React, { useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Check, Pencil, RotateCcw, Save, X } from "lucide-react";

export type ConversionFile = {
  path: string;
  content: string;
};

type ReviewStatus = "ai-output" | "edited" | "accepted";

interface FileReviewState {
  status: ReviewStatus;
  editedContent: string;
  isEditing: boolean;
}

type Props = {
  files?: ConversionFile[];
  onDownloadFile?: (file: ConversionFile) => void;
  onDownloadAll?: (files: ConversionFile[]) => void;
};

const STATUS_BADGE: Record<ReviewStatus, { label: string; className: string }> = {
  "ai-output": {
    label: "AI Output",
    className: "bg-gray-100 text-gray-500",
  },
  edited: {
    label: "Reviewed & Edited",
    className: "bg-amber-100 text-amber-700",
  },
  accepted: {
    label: "Accepted",
    className: "bg-green-100 text-green-700",
  },
};

const ConversionResultUI: React.FC<Props> = ({ onDownloadFile, onDownloadAll }) => {
  const routerLocation = useLocation();
  const previousFiles: ConversionFile[] = routerLocation?.state?.previous || [];
  const updatedFiles: ConversionFile[] = routerLocation?.state?.updated || [];

  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // review state keyed by file path
  const [reviewMap, setReviewMap] = useState<Record<string, FileReviewState>>({});

  const selected = previousFiles.length > 0 ? previousFiles[selectedIndex] : null;

  // ── helpers ──────────────────────────────────────────────────────────────

  const getAIContent = useCallback(
    (path: string): string => {
      let f = updatedFiles.find((u) => u.path === path);
      if (!f) {
        const filename = path.split("/").pop();
        f = updatedFiles.find((u) => u.path?.split("/").pop() === filename);
      }
      return f?.content || "";
    },
    [updatedFiles]
  );

  const getReviewState = useCallback(
    (path: string): FileReviewState =>
      reviewMap[path] ?? {
        status: "ai-output",
        editedContent: getAIContent(path),
        isEditing: false,
      },
    [reviewMap, getAIContent]
  );

  // what actually gets downloaded / shown as "final"
  const getFinalContent = useCallback(
    (path: string): string => {
      const rs = getReviewState(path);
      return rs.status === "edited" ? rs.editedContent : getAIContent(path);
    },
    [getReviewState, getAIContent]
  );

  const patchReview = (path: string, patch: Partial<FileReviewState>) => {
    setReviewMap((prev) => ({
      ...prev,
      [path]: { ...getReviewState(path), ...patch },
    }));
  };

  // ── review actions ────────────────────────────────────────────────────────

  const enterReviewMode = (path: string) => {
    const rs = getReviewState(path);
    patchReview(path, {
      isEditing: true,
      // seed editor with current final content so edits start from the right base
      editedContent: getFinalContent(path),
    });
  };

  const saveChanges = (path: string) => {
    patchReview(path, { isEditing: false, status: "edited" });
  };

  const resetToAI = (path: string) => {
    patchReview(path, {
      editedContent: getAIContent(path),
      status: "ai-output",
      isEditing: true, // stay in edit mode so user can keep editing if they want
    });
  };

  const acceptAsIs = (path: string) => {
    patchReview(path, { isEditing: false, status: "accepted" });
  };

  const cancelEdit = (path: string) => {
    patchReview(path, { isEditing: false });
  };

  // ── download ──────────────────────────────────────────────────────────────

  const downloadBlob = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFile = (f: ConversionFile) => {
    if (onDownloadFile) { onDownloadFile(f); return; }
    const content = getFinalContent(f.path) || f.content || "";
    const name = f.path.split("/").pop() || "file.txt";
    downloadBlob(content, name);
  };

  const handleDownloadAll = async () => {
    if (onDownloadAll) { onDownloadAll(previousFiles); return; }
    const zip = new JSZip();
    previousFiles.forEach((f) => {
      zip.file(f.path, getFinalContent(f.path) || f.content || "");
    });
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, "converted-files.zip");
  };

  // ── render helpers ────────────────────────────────────────────────────────

  const renderStatusBadge = (path: string) => {
    const { status } = getReviewState(path);
    const { label, className } = STATUS_BADGE[status];
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${className}`}>
        {label}
      </span>
    );
  };

  const renderRightPanel = () => {
    if (!selected) return null;
    const rs = getReviewState(selected.path);
    const aiContent = getAIContent(selected.path);
    const finalContent = getFinalContent(selected.path);

    if (rs.isEditing) {
      return (
        <section className="bg-white rounded-lg border-2 border-indigo-400 p-4 overflow-hidden shadow-md flex flex-col">
          {/* edit mode banner */}
          <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-indigo-50 rounded-md border border-indigo-200">
            <Pencil className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span className="text-xs font-medium text-indigo-700">
              Edit Mode — {selected.path.split("/").pop()}
            </span>
          </div>

          {/* toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <button
              onClick={() => saveChanges(selected.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </button>
            <button
              onClick={() => resetToAI(selected.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-amber-100 text-amber-700 hover:bg-amber-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to AI Output
            </button>
            <button
              onClick={() => acceptAsIs(selected.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Accept as-is
            </button>
            <button
              onClick={() => cancelEdit(selected.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition cursor-pointer ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>

          {/* editable textarea */}
          <textarea
            className="flex-1 w-full font-mono text-sm text-gray-800 bg-indigo-50 border border-indigo-200 rounded-md p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 leading-relaxed min-h-[380px]"
            value={rs.editedContent}
            onChange={(e) =>
              patchReview(selected.path, { editedContent: e.target.value })
            }
            spellCheck={false}
          />
          <div className="text-xs text-gray-400 mt-1 text-right">
            {rs.editedContent.split("\n").length} lines
          </div>
        </section>
      );
    }

    // view mode (not editing)
    return (
      <section className="bg-white rounded-lg border border-gray-100 p-4 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium text-green-500">Updated</div>
            {renderStatusBadge(selected.path)}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-400">
              {finalContent.split("\n").length} lines
            </div>
            <button
              onClick={() => enterReviewMode(selected.path)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
            >
              <Pencil className="w-3 h-3" />
              Review Code
            </button>
          </div>
        </div>
        <div className="text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[420px] rounded-md bg-gray-50 p-2">
          <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-green-50 p-2">
            {finalContent || "No updated content"}
          </pre>
        </div>
      </section>
    );
  };

  // ── main render ───────────────────────────────────────────────────────────

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-sm max-w-7xl mt-20 mx-auto">
      <header className="flex items-center justify-between mt-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Conversion Results
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review converted files and download outputs
          </p>
        </div>
      </header>

      <hr className="mt-4 mb-6 border-gray-200" />

      <div className="flex gap-6">
        {/* ── file list sidebar ── */}
        <aside className="w-72 bg-white rounded-lg border border-gray-100 shadow-sm p-3 max-h-[520px] overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-700">Files</div>
            <div className="text-xs text-gray-400">{previousFiles?.length}</div>
          </div>
          <ul className="space-y-2 overflow-y-auto max-h-[430px] px-1 py-2">
            {previousFiles.length === 0 && (
              <li className="text-sm text-gray-500 p-2">No files to show</li>
            )}
            {previousFiles.map((f, idx) => {
              const rs = getReviewState(f.path);
              return (
                <li
                  key={f?.path + idx}
                  className={`flex flex-col p-3 rounded-md cursor-pointer transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
                    idx === selectedIndex
                      ? "bg-indigo-50 ring-1 ring-indigo-200"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => setSelectedIndex(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && setSelectedIndex(idx)}
                  aria-label={`Select file ${f?.path}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium text-gray-800 truncate">
                      {f?.path?.split("/").pop()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <div className="text-xs text-gray-400 truncate">
                      {f?.path}
                    </div>
                    {/* status badge in sidebar */}
                    {rs.status !== "ai-output" && (
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1 ${STATUS_BADGE[rs.status].className}`}
                      >
                        {rs.status === "edited" ? "✎" : "✓"}
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* ── main panels ── */}
        <main className="flex-1 min-w-0">
          {selected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* left — original, always read-only */}
              <section className="bg-white rounded-lg border border-gray-100 p-4 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-red-500">Previous</div>
                  <div className="text-xs text-gray-400">
                    {(selected?.content ?? "").split("\n")?.length} lines
                  </div>
                </div>
                <div className="text-sm font-mono text-gray-800 whitespace-pre-wrap overflow-y-auto max-h-[420px] rounded-md bg-gray-50 p-2">
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed bg-red-50 p-2">
                    {selected?.content || "No content"}
                  </pre>
                </div>
              </section>

              {/* right — AI output / edit mode */}
              {renderRightPanel()}
            </div>
          ) : (
            <div className="p-6 bg-white rounded-lg border border-gray-100 text-gray-500">
              No file selected
            </div>
          )}
        </main>
      </div>

      <hr className="mt-8 mb-3 border-gray-200" />

      {/* ── download section ── */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
              Converted Files
            </h1>
            <p className="text-sm text-gray-500 mt-1">download converted files</p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium cursor-pointer bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition"
            onClick={handleDownloadAll}
            aria-label="Download all files"
          >
            Download All
          </button>
        </div>

        <div
          className={`space-y-2 ${
            previousFiles?.length > 5 ? "overflow-y-auto max-h-[240px]" : ""
          }`}
        >
          {previousFiles.map((f) => {
            const rs = getReviewState(f.path);
            const badge = STATUS_BADGE[rs.status];
            return (
              <div
                key={f?.path}
                className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-100 shadow-sm"
              >
                <div className="flex items-center gap-3 min-w-0 mr-4">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {f?.path?.split("/").pop()}
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className="px-3 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
                    onClick={() => {
                      setSelectedIndex(previousFiles.indexOf(f));
                      enterReviewMode(f.path);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Review
                  </button>
                  <button
                    className="px-3 py-1 rounded-md text-sm bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300 transition cursor-pointer"
                    onClick={() => handleDownloadFile(f)}
                    aria-label={`Download ${f?.path}`}
                  >
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ConversionResultUI;
