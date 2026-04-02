import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import ConversionSection from "../../../components/conversion/ConversionSection";
import BackButton from "../../../components/button/BackButton";
import config from "../../../config/env";

const {
  apiBaseUrl: API_BASE_URL,
  githubAppUrl: GITHUB_APP_URL,
  githubPopupConfig: GITHUB_POPUP_CONFIG,
  messageAutoDismissDuration: MESSAGE_AUTO_DISMISS_DURATION,
} = config;

export default function ConversionPage() {
  const location = useLocation();
  const [message, setMessage] = useState(null);
  const [githubFiles, setGithubFiles] = useState(null);

  // Store pending repo request to retry after auth
  const pendingRepoRequest = useRef(null);

  // Check if files were passed from analysis page
  const analysisFiles = location.state?.filesToConvert || null;

  const MessageBanner = ({ message, onClose }) => {
    if (!message) return null;

    const styles = {
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
        className={`${style.bg} border ${style.text} px-4 py-3 rounded-lg mb-6 flex items-center justify-between`}
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
    type,
    text,
    duration = MESSAGE_AUTO_DISMISS_DURATION
  ) => {
    setMessage({ type, text });
    if (duration) {
      setTimeout(() => setMessage(null), duration);
    }
  };

  const loginWithGitHub = () => {
    const popup = window.open(GITHUB_APP_URL, "_blank", GITHUB_POPUP_CONFIG);

    if (!popup) {
      showMessage("error", "Popup blocked! Please allow popups for this site.");
    } else {
      showMessage(
        "info",
        "Please complete the GitHub authentication in the popup window."
      );
    }
  };

  const fetchRepository = async (token, owner, repo, path) => {
    try {
      showMessage("info", "Fetching repository files...");

      const response = await axios.post(`${API_BASE_URL}/fetch-repo`, {
        owner,
        repo,
        path,
        token,
      });

      const { data, stats } = response.data;

      console.log("✅ Repository fetched:", response.data);

      showMessage(
        "success",
        `Repository "${owner}/${repo}" fetched successfully! Found ${stats.total} files.`
      );

      // Set the fetched files to state
      setGithubFiles(data);

      // Clear pending request
      pendingRepoRequest.current = null;

      return response.data;
    } catch (error) {
      console.error("❌ Error fetching repository:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      showMessage("error", `Error fetching repository: ${errorMessage}`);
      throw error;
    }
  };

  const handleGithubRepo = async (owner, repo, path) => {
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
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("github_token");
        showMessage("error", "Authentication expired. Please log in again.");
        setTimeout(() => loginWithGitHub(), 2000);
      }
    }
  };

  // Handle auth messages from popup
  useEffect(() => {
    const handleMessage = async (event) => {
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
        pendingRepoRequest.current = null;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
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

        <BackButton className="mb-4" />

        {/* Message Banner */}
        {message && (
          <MessageBanner message={message} onClose={() => setMessage(null)} />
        )}

        {/* Info banner if files came from analysis */}
        {analysisFiles && analysisFiles.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-blue-800 font-medium">
                {analysisFiles.length} files loaded from analysis
              </p>
              <p className="text-blue-600 text-sm">
                These files are ready to be converted to modern React
              </p>
            </div>
          </div>
        )}

        {/* Conversion Section */}
        <ConversionSection
          framework="react"
          handleGithubRepo={handleGithubRepo}
          githubFiles={githubFiles}
          analysisFiles={analysisFiles}
        />
      </div>
    </div>
  );
}
