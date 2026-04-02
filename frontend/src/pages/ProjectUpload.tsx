import React, { useEffect, useState, useRef } from "react";
import TabSection from "../components/TabSection";
import FrameworkSelection from "../components/framework/frameworkSelection";
import axios from "axios";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import config from "../config/env";
import { connectToGit } from "../services/git.service";

const {
  apiBaseUrl: API_BASE_URL,
  githubAppUrl: GITHUB_APP_URL,
  githubPopupConfig: GITHUB_POPUP_CONFIG,
  messageAutoDismissDuration: MESSAGE_AUTO_DISMISS_DURATION,
} = config;

const ProjectUpload = () => {
  const [selectedFramework, setSelectedFramework] = useState(null);
  const [message, setMessage] = useState<any>(null);
  const [githubFiles, setGithubFiles] = useState(null);

  // Store pending repo request to retry after auth
  const pendingRepoRequest = useRef<any>(null);

  const MessageBanner = ({ message, onClose }: any) => {
    if (!message) return null;

    const styles: any = {
      success: {
        bg: "bg-green-50 border-green-200",
        text: "text-green-800",
        icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      },
      error: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: <XCircle className="w-5 h-5 text-red-600" />,
      },
      info: {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      },
    };

    const style = styles[message.type] || styles.info;

    return (
      <div
        className={`${style.bg} border ${style.text} px-4 py-3 rounded-lg mb-4 flex items-center justify-between`}
      >
        <div className="flex items-center">
          {style.icon}
          <span className="ml-2">{message.text}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-500 hover:text-gray-700"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const showMessage = (
    type: any,
    text: string,
    duration = MESSAGE_AUTO_DISMISS_DURATION
  ) => {
    setMessage({ type, text });
    if (duration) {
      setTimeout(() => setMessage(null), duration);
    }
  };

  const loginWithGitHub = async () => {
    const connectResp = await connectToGit();
    let popup = null;
    if (connectResp) {
      popup = window.open(GITHUB_APP_URL, "_blank", connectResp?.data);
      if (!popup) {
        showMessage("error", "Popup blocked! Please allow popups for this site.");
      } else {
        showMessage(
          "info",
          "Please complete the GitHub authentication in the popup window."
        );
      }
    }
  };

  const fetchRepository = async (token: string, owner: string, repo: string, path: string) => {
    try {
      showMessage("info", "Fetching repository...");

      const response = await axios.post(`${API_BASE_URL}/fetch-repo`, {
        owner,
        repo,
        path,
        token,
      });

      const { data, stats } = response.data;

      console.log("✅ Full Response:", response.data);

      showMessage(
        "success",
        `Repository "${owner}/${repo}" fetched successfully! Found ${stats.total} files.`
      );

      // Set the fetched files to state so TabSection can use them
      setGithubFiles(data);

      // Clear pending request after successful fetch
      pendingRepoRequest.current = null;

      return response.data;
    } catch (error: any) {
      console.error("❌ Error Details:", error);
      console.error("Response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      showMessage("error", `Error fetching repository: ${errorMessage}`);
      throw error;
    }
  };

  const handleAnalysis = (result: any, files: File[]) => {
    showMessage(
      "success",
      `Analysis complete! Processed ${files.length} files.`
    );
  };

  const handleGithubRepo = async (owner: string, repo: string, path: string) => {
    const token = localStorage.getItem("github_token");

    // Store the request details for retry after auth
    pendingRepoRequest.current = { owner, repo, path };

    if (!token) {
      showMessage(
        "info",
        "GitHub authentication required. Opening authentication window..."
      );
      loginWithGitHub();
      return;
    }

    try {
      await fetchRepository(token, owner, repo, path);
    } catch (error: any) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("github_token");
        showMessage("error", "Authentication expired. Please log in again.");
        setTimeout(() => loginWithGitHub(), 2000);
      }
    }
  };

  useEffect(() => {
    const handleMessage = async (event: any) => {
      if (event.origin !== window.location.origin) return;

      if (event.data.type === "auth_success") {
        const { token } = event.data;
        if (token) {
          localStorage.setItem("github_token", token);
          showMessage("success", "GitHub authentication successful!");

          // Auto-retry the pending repository fetch
          if (pendingRepoRequest.current) {
            const { owner, repo, path } = pendingRepoRequest.current;
            try {
              await fetchRepository(token, owner, repo, path);
            } catch (error) {
              console.error("Failed to fetch after auth:", error);
            }
          }
        }
      } else if (event.data.type === "auth_error") {
        const errorMsg = event.data.error || "Authentication failed";
        showMessage("error", `GitHub authentication failed: ${errorMsg}`);
        // Clear pending request on auth error
        pendingRepoRequest.current = null;
      }
    };

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);


  // =========== New code with bacnkedn apis to connect and manage github repos aceess and installation

  return (
    <>
      {/* Test */}
      {/* <button onClick={conectGituhub}>Connect Git</button> */}


      {/* ==========Test========== */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {!selectedFramework ? (
            <FrameworkSelection
              selectedFramework={selectedFramework}
              onSelectFramework={setSelectedFramework}
            />
          ) : (
            <>
              <div className="mb-6">
                <button
                  className="text-sm text-indigo-600 hover:underline cursor-pointer"
                  onClick={() => setSelectedFramework(null)}
                >
                  ← Change framework
                </button>
                <div className="mt-2 text-gray-700">
                  Selected:{" "}
                  <span className="font-semibold capitalize">
                    {selectedFramework}
                  </span>
                </div>
              </div>

              {message && (
                <div className="max-w-5xl mx-auto mb-6">
                  <MessageBanner
                    message={message}
                    onClose={() => setMessage(null)}
                  />
                </div>
              )}

              {/* <TabSection
                framework={selectedFramework}
                onAnalysisComplete={handleAnalysis}
                handleGithubRepo={handleGithubRepo}
                githubFiles={githubFiles}
              /> */}

              <TabSection
                key={selectedFramework === 'jsp' ? 'tab-jsp' : `tab-${selectedFramework}`}
                framework={selectedFramework}
                onAnalysisComplete={handleAnalysis}
                handleGithubRepo={handleGithubRepo}
                githubFiles={githubFiles}
              />

            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectUpload;
