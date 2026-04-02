import { useState } from "react";
import { BarChart3 } from "lucide-react";
import { reactAnalyzeCode } from "../../../services/analysisReact";
import { parseAIResult } from "../../../utils/react/parseAIResult";
import { traverseGitHubRepo } from "../../../utils/react/githubHelpers";
import TabSection from "../../../components/analysis/TabSection";
import ResultsSection from "../../../components/analysis/ResultSection";

const AnalysisPage = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [repoUrl, setRepoUrl] = useState("");
  const [fetchingRepo, setFetchingRepo] = useState(false);

  const analyzeWithAI = async () => {
    setAnalyzing(true);
    try {
      const resultText = await reactAnalyzeCode(uploadedFiles);
      console.log("RAW AI Result Text:", resultText);
      console.log("RAW AI Result Length:", resultText?.length);

      if (!resultText || resultText.trim() === "") {
        alert("AI returned empty response. Check browser console for errors.");
        setAnalyzing(false);
        return;
      }

      const structuredResult = parseAIResult(resultText);
      console.log("Structured Result:", structuredResult);
      setAnalysisResult(structuredResult);
    } catch (error) {
      console.error("AI analysis failed:", error);
      alert(
        "Failed to analyze with AI. Please check your API key or try again."
      );
    }
    setAnalyzing(false);
  };

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
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const files = await traverseGitHubRepo(owner, repo);

      if (files.length === 0) {
        alert("No JavaScript/TypeScript files found in the repository");
        setFetchingRepo(false);
        setAnalyzing(false);
        return;
      }

      // console.log(`Fetched ${files.length} files from GitHub repository`);
      // const hasPackageJson = files.some((f) => f.name === "package.json");
      // console.log(`package.json found: ${hasPackageJson}`);

      setUploadedFiles(files);
      setFetchingRepo(false);

      const resultText = await reactAnalyzeCode(files);
      // console.log("AI Result Text:", resultText);

      const structuredResult = parseAIResult(resultText);
      setAnalysisResult(structuredResult);
    } catch (error) {
      console.error("GitHub analysis failed:", error);

      let errorMessage =
        "Failed to analyze GitHub repository. Please try again.";

      if (error.message.includes("404")) {
        errorMessage =
          "Repository not found. Make sure it's public and the URL is correct.";
      } else if (error.message.includes("403")) {
        errorMessage =
          "Access forbidden. The repository might be private or you've hit the API rate limit.";
      } else if (error.message.includes("API error")) {
        errorMessage =
          "GitHub API error. Please check the repository URL and try again.";
      }

      alert(errorMessage);
      setFetchingRepo(false);
    }

    setAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <BarChart3 className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-3xl font-bold text-gray-900">
            AI-Powered React Migration Analysis
          </h2>
        </div>

        <TabSection
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          uploadedFiles={uploadedFiles}
          setUploadedFiles={setUploadedFiles}
          analyzing={analyzing}
          analyzeWithAI={analyzeWithAI}
          repoUrl={repoUrl}
          setRepoUrl={setRepoUrl}
          fetchingRepo={fetchingRepo}
          analyzeGitHubRepo={analyzeGitHubRepo}
        />

        {analysisResult && <ResultsSection analysisResult={analysisResult} />}
      </div>
    </div>
  );
};

export default AnalysisPage;
