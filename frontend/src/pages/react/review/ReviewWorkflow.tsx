import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewPage from "../../../components/review/ReviewPage";
import {
  refineConvertedCode,
  validateConversion,
} from "../../../services/feedbackLoopService";


const ReviewWorkflow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("Location state:", location.state);

    if (location.state?.convertedFiles) {
      console.log("Setting converted files:", location.state.convertedFiles);
      setConvertedFiles(location.state.convertedFiles);
    } else {
      console.log("No converted files found in state");
      alert("No files to review. Please convert files first.");
      navigate("/conversion");
    }
  }, [location.state, navigate]);

  
  const handleRefineFile = async (fileIndex, feedback) => {
    try {
      setLoading(true);

      const file = convertedFiles[fileIndex];
      console.log("Refining file:", file.name, "with feedback:", feedback);

      const refinedContent = await refineConvertedCode(file, feedback);

      const updatedFiles = [...convertedFiles];
      updatedFiles[fileIndex] = {
        ...file,
        content: refinedContent,
        previousVersions: [
          ...(file.previousVersions || []),
          {
            content: file.content,
            feedback: feedback,
            refinedAt: new Date().toISOString(),
          },
        ],
        userFeedback: feedback,
        refinedAt: new Date().toISOString(),
      };

      setConvertedFiles(updatedFiles);
      console.log("File refined successfully");

      alert(
        `✅ Success!\n\n"${file.name}" has been refined based on your feedback.`
      );

      try {
        const validation = await validateConversion(updatedFiles[fileIndex]);
        console.log("Validation result:", validation);

        if (validation.score < 80) {
          const showDetails = window.confirm(
            `⚠️ Validation Notice\n\nThe refined code scored ${validation.score}/100.\n\nWould you like to see the validation details?`
          );

          if (showDetails) {
            const details =
              `Validation Score: ${validation.score}/100\n\n` +
              `Issues:\n${validation.issues.join("\n")}\n\n` +
              `Warnings:\n${validation.warnings.join("\n")}`;
            alert(details);
          }
        }
      } catch (validationError) {
        console.error("Validation error:", validationError);
      }

      return refinedContent;
    } catch (error) {
      console.error("Error refining file:", error);
      alert(
        `❌ Refinement Failed\n\n${error.message}\n\nPlease try again or modify your feedback.`
      );
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle rejection of a file (remove from conversion list)
   */
  const handleRejectFile = (fileIndex) => {
    const file = convertedFiles[fileIndex];

    const confirmed = window.confirm(
      `⚠️ Reject File?\n\n` +
        `Are you sure you want to reject "${file.name}"?\n\n` +
        `This will remove it from your conversion list.`
    );

    if (confirmed) {
      const updatedFiles = convertedFiles.filter(
        (_, index) => index !== fileIndex
      );
      setConvertedFiles(updatedFiles);
      console.log("File rejected:", file.name);

      // Show success message
      alert(
        `✅ File Rejected\n\n"${file.name}" has been removed from your conversion list.`
      );

      if (updatedFiles.length === 0) {
        alert("All files have been rejected. Returning to conversion page.");
        navigate("/conversion");
      }
    }
  };

  /**
   * Handle accepting all files - shows GitHub repo creation popup
   */
  const handleAcceptAll = async () => {
    console.log("Accept All clicked!");

    if (convertedFiles.length === 0) {
      alert("No files to accept.");
      return;
    }

    // Show GitHub repo creation popup
    const message =
      `🎉 Review Complete!\n\n` +
      `${convertedFiles.length} file(s) have been successfully reviewed.\n\n` +
      `Ready to create a GitHub repository?\n\n` +
      `Click OK to proceed with GitHub repository creation.`;

    const confirmed = window.confirm(message);

    if (confirmed) {
      alert(
        `🚀 GitHub Repository Creation\n\n` +
          `This feature will create a new GitHub repository with your converted files.\n\n` +
          `GitHub integration coming soon!\n\n` +
          `For now, you can download all files from the review page.`
      );

      console.log("User confirmed GitHub repo creation");
      // TODO: Add GitHub integration here in next section
    } else {
      console.log("GitHub repo creation cancelled by user");
    }
  };

  if (convertedFiles.length === 0 && !location.state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading files...</p>
        </div>
      </div>
    );
  }

  return (
    <>
   
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
            </div>
            <p className="text-gray-800 font-semibold text-center text-lg">
              AI is working...
            </p>
            <p className="text-gray-600 text-center mt-2">
              Please wait while we process your request
            </p>
          </div>
        </div>
      )}

      {convertedFiles.length > 0 && (
        <ReviewPage
          convertedFiles={convertedFiles}
          onRefineWithFeedback={handleRefineFile}
          onRejectFile={handleRejectFile}
          onAcceptAll={handleAcceptAll}
        />
      )}
    </>
  );
};

export default ReviewWorkflow;
