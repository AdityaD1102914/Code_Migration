// Latest code Except Java Backend files
import { useEffect, useState } from "react";
import {
  Upload,
  FileCode,
  ExternalLink,
  Github,
  Trash,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/LegacyLift/components/ui/card";
import { Button } from "@/LegacyLift/components/ui/button";
import { ScrollArea } from "@/LegacyLift/components/ui/scroll-area";
import ProgressBar from "./ProgressBar";
import { AnalysisData } from "@/LegacyLift/types/analysis";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { Input } from "./ui/input";
import { useToast } from "@/LegacyLift/hooks/use-toast";
import { useApi } from "@/LegacyLift/services/useApi";
import JSZip from "jszip";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/LegacyLift/contexts/useContext";
import { useStep } from "../contexts/useStepContext";

interface FileUploadZoneProps {
  onFilesUpload: (files: File[]) => void;
  onGithubAnalyze: (repoUrl: string) => void;
  uploadedFiles: Array<{ name: string; content: string }>;
  isLoading: boolean;
  isReportData?: boolean;
  analysisAPIData?: string | AnalysisData | null;
  filesList?: Array<{ name: string; content: string }>;
}

export const FileUploadZone = ({
  onFilesUpload,
  onGithubAnalyze,
  uploadedFiles,
  isLoading,
  isReportData = false,
  analysisAPIData,
  filesList,
}: FileUploadZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalzing, setIsAnalzing] = useState(false);
  const [githubUrl, setGithubUrl] = useState("");
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();
  const { apiCall, loading, error } = useApi();
  const navigate = useNavigate();
  const { setAnalysisReportJson } = useAppContext();
  // Dummy JSON with file names
  const [files, setFiles] = useState(filesList || []);
  // Step Context
  const { setStep } = useStep();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) {
      toast({ title: "No files dropped" });
      return;
    }

    if (files.length > 1) {
      toast({
        variant: "destructive",
        title: "Too Many Files",
        description: "Please upload a single .zip file.",
      });
      return;
    }

    const file = files[0];
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Only .zip files are supported.",
      });
      return;
    }

    onFilesUpload([file]); // send the ZIP file directly
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // ✅ Only allow .zip
      if (!file.name.toLowerCase().endsWith(".zip")) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please upload a .zip file containing your JSP project.",
        });
        e.target.value = "";
        return;
      }

      // ✅ Pass the raw ZIP file (not content) to onFilesUpload
      onFilesUpload([file]);
      e.target.value = "";
    }
  };

  const handleDeleteFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    window.scrollTo(0, 0);
    setIsAnalzing(true);
    if (!files || files.length === 0) {
      toast({
        variant: "destructive",
        title: "No Files",
        description: "Please upload some files first.",
      });
      return;
    }

    const zip = new JSZip();

    // Add each file as its own entry in the zip
    files.forEach((file) => {
      zip.file(file.name, file.content || "");
    });

    // Generate the zip file
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Create FormData to send the zip file to API
    const formData = new FormData();
    formData.append("folder", zipBlob, "files.zip");
    formData.append("filterZip", "true");

    // Send to API
    const response = await apiCall({
      method: "POST",
      url: "/analyze-project", // Replace with your actual API endpoint
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (response?.data?.status == 200 && !response?.data?.report[0]?.error) {
      setAnalysisReportJson(response?.data?.report)

      // Update step before navigation
      setStep(2);

      navigate("/analysis", {
        state: { analysisAPIData: response?.data?.report },
      });
      toast({
        title: response?.data?.message || "Analysis Complete!",
        description: "Your Analysis Report is Ready.",
      });
      setIsAnalzing(false);
    } else {
      setIsAnalzing(false);
      toast({
        variant: "destructive",
        title: "Analysis Failed Please Try Again !!",
        description: "There was an error of AI service during ZIP analysis",
      });
    }
  };

  const popularRepos = [
    {
      name: "Apache Struts",
      tech: "Legacy MVC framework using JSP",
      icon: "🏛️",
    },
    {
      name: "Spring MVC",
      tech: "Java-based web framework with JSP views",
      icon: "🌱",
    },
    {
      name: "JSF (JavaServer Faces)",
      tech: "Component-based UI framework for Java EE",
      icon: "🎭",
    },
    {
      name: "JSP Examples",
      tech: "Sample JSP projects and templates",
      icon: "📄",
    },
  ];

  useEffect(() => {
    setFiles(filesList || []);
  }, [filesList]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      {isLoading ? (
        <ProgressBar
          isReportData={isReportData}
          analysisAPIData={analysisAPIData}
        />
      ) : (
        <>
          {!isAnalzing ? (
            <>
              <Card className="border-0 shadow-md bg-transparent overflow-hidden">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  {/* Tabs Header */}
                  <TabsList
                    className="
                        w-full grid grid-cols-2 rounded-none
                        border-b border-[oklch(88%_0.01_270)]
                        bg-[oklch(97%_0.01_270)]
                        dark:bg-[oklch(28%_0.02_270)]
                        dark:border-[oklch(35%_0.02_270)]
                      "
                  >
                    <TabsTrigger
                      value="upload"
                      className="
                        group
                        flex items-center justify-center gap-2 py-4 text-sm font-semibold rounded-none
                        text-[oklch(35%_0.02_270)]
                        hover:text-black/80
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]
                        data-[state=active]:bg-white
                        data-[state=active]:text-[#7B61FF]
                        data-[state=active]:border-b-2
                        data-[state=active]:border-[#7B61FF]

                        dark:text-[oklch(96%_0.01_270)]
                        dark:data-[state=active]:bg-[oklch(22%_0.02_270)]
                        dark:focus-visible:ring-[#7B61FF]
                      "
                    >
                      <Upload
                        className="h-5 w-5 text-[oklch(55%_0.02_270)] group-data-[state=active]:text-[#7B61FF]"
                      />
                      Upload Files
                    </TabsTrigger>

                    <TabsTrigger
                      value="github"
                      className="
                        group
                        flex items-center justify-center gap-2 py-4 text-sm font-semibold rounded-none
                        text-[oklch(35%_0.02_270)]
                        hover:text-black/80
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]
                        data-[state=active]:bg-white
                        data-[state=active]:text-[#7B61FF]
                        data-[state=active]:border-b-2
                        data-[state=active]:border-[#7B61FF]
                        dark:text-[oklch(96%_0.01_270)]
                        dark:data-[state=active]:bg-[oklch(22%_0.02_270)]
                        dark:focus-visible:ring-[#7B61FF]
                      "
                    >
                      <Github
                        className="
                          h-5 w-5 text-[oklch(55%_0.02_270)]
                          group-data-[state=active]:text-[#7B61FF]
                        "
                      />
                      GitHub Repository
                    </TabsTrigger>
                  </TabsList>

                  {/* Upload Tab Content */}
                  <TabsContent value="upload" className="m-0 p-0">
                    <div className={`p-12 ${files && files.length > 0 ? "pb-0" : ""}`}>
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                          relative rounded-2xl p-16 text-center transition-all
                          border border-dashed
                          ${files && files.length > 0 ? "pb-0" : ""}

                          ${isDragging
                                              ? "border-[#7B61FF] bg-[#7B61FF]/5"
                                              : "border-[oklch(88%_0.01_270)] bg-[oklch(97%_0.01_270)]"}
                          dark:${isDragging
                                              ? "border-[#7B61FF] bg-[#7B61FF]/10"
                                              : "border-[oklch(35%_0.02_270)] bg-[oklch(28%_0.02_270)]"}
                          shadow-md
                        `}
                      >
                        {/* Full-surface file input */}
                        <input
                          type="file"
                          accept=".zip"
                          onChange={handleFileChange}
                          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                          id="file-upload"
                          disabled={isLoading}
                        />

                        {/* Icon tile */}
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#7B61FF]/10">
                          <Upload className="h-10 w-10 text-[#7B61FF]" />
                        </div>

                        {/* Heading & helper text */}
                        <h3 className="mb-3 text-3xl font-semibold text-[oklch(35%_0.02_270)] dark:text-[oklch(96%_0.01_270)]">
                          Upload Your JSP Project as a ZIP File
                        </h3>
                        <p className="mb-8 text-[oklch(55%_0.02_270)] dark:text-[oklch(80%_0.02_270)]">
                          Drag &amp; drop a .zip file or click to browse
                        </p>

                        {/* Primary gradient button (purple -> green) */}
                        <Button
                          size="lg"
                          className="
                            text-white shadow-lg
                            [background-image:linear-gradient(90deg,#7B61FF,#22C55E)]
                            hover:[filter:brightness(1.05)]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]
                          "
                        >
                          <FileCode className="mr-2 h-5 w-5" />
                          Choose Files
                        </Button>

                        {/* Divider and note */}
                        <div className="mt-8 border-t border-[oklch(88%_0.01_270)] dark:border-[oklch(35%_0.02_270)] py-8 text-center">
                          <span className="text-sm font-semibold text-[oklch(55%_0.02_270)] dark:text-[oklch(80%_0.02_270)]">
                            Your ZIP must contain .jsp files.
                          </span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* GitHub Tab Content */}
                  <TabsContent value="github" className="m-0 p-0">
                    <div className="p-12">
                      {/* Header */}
                      <div className="mb-8 text-center">
                        <div
                          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl
                   bg-[oklch(35%_0.02_270)] text-white
                   dark:bg-[oklch(96%_0.01_270)] dark:text-black"
                        >
                          <Github className="h-10 w-10" />
                        </div>

                        <h3
                          className="mb-3 text-3xl font-semibold
                   text-[oklch(35%_0.02_270)]
                   dark:text-[oklch(96%_0.01_270)]"
                        >
                          Analyze GitHub Repository
                        </h3>
                        <p
                          className="text-[oklch(55%_0.02_270)]
                   dark:text-[oklch(80%_0.02_270)]"
                        >
                          Enter a GitHub repository URL to analyze your legacy project.
                        </p>
                      </div>

                      {/* URL + CTA */}
                      <div className="mx-auto max-w-2xl space-y-4">
                        <div className="flex gap-3">
                          <Input
                            type="url"
                            placeholder="https://github.com/username/repository"
                            value={githubUrl}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                              setGithubUrl(e.target.value)
                            }
                            className="
                              h-12 flex-1 text-base rounded-xl
                              bg-white text-[oklch(35%_0.02_270)]
                              border border-[oklch(88%_0.01_270)]
                              shadow-sm
                              placeholder:text-[oklch(55%_0.02_270)]
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]

                              dark:bg-[oklch(22%_0.02_270)]
                              dark:text-[oklch(96%_0.01_270)]
                              dark:border-[oklch(35%_0.02_270)]
                              dark:placeholder:text-[oklch(80%_0.02_270)]
                            "
                          />

                          <Button
                            onClick={() => onGithubAnalyze(githubUrl)}
                            size="lg"
                            className="
                              px-8 text-white
                              [background-image:linear-gradient(90deg,#7B61FF,#22C55E)]
                              hover:[filter:brightness(1.05)]
                              shadow-sm
                              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7B61FF]
                            "
                          >
                            <Github className="mr-2 h-5 w-5" />
                            Analyze Repository
                          </Button>
                        </div>

                        {/* Popular repos */}
                        <div className="mt-12">
                          <p
                            className="mb-6 text-center text-sm font-semibold
                     text-[oklch(55%_0.02_270)]
                     dark:text-[oklch(80%_0.02_270)]"
                          >
                            Popular repositories to try:
                          </p>

                          <div className="grid grid-cols-2 gap-4">
                            {popularRepos.map((repo) => (
                              <button
                                key={repo.name}
                                className="
                                  group flex items-start gap-3 rounded-xl p-4 text-left transition-all
                                  bg-white border border-[oklch(88%_0.01_270)] shadow-sm
                                  hover:border-[#7B61FF] hover:shadow-md

                                  dark:bg-[oklch(22%_0.02_270)]
                                  dark:border-[oklch(35%_0.02_270)]
                                "
                                onClick={() =>
                                  setGithubUrl(
                                    `https://github.com/${repo.name
                                      .toLowerCase()
                                      .replace(/\s+/g, "-")}`,
                                  )
                                }
                              >
                                <span className="text-2xl">{repo.icon}</span>

                                <div className="flex-1">
                                  <div
                                    className="
                                      font-semibold transition-colors
                                      text-[oklch(35%_0.02_270)] group-hover:text-[#7B61FF]
                                      dark:text-[oklch(96%_0.01_270)]
                                    "
                                  >
                                    {repo.name}
                                  </div>
                                  <div
                                    className="text-sm
                              text-[oklch(55%_0.02_270)]
                              dark:text-[oklch(80%_0.02_270)]"
                                  >
                                    {repo.tech}
                                  </div>
                                </div>

                                <ExternalLink
                                  className="
                                    h-4 w-4
                                    text-[oklch(55%_0.02_270)]
                                    opacity-0 transition-opacity group-hover:opacity-100
                                    dark:text-[oklch(80%_0.02_270)]
                                  "
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                </Tabs>
                <div
                  className={files && files.length > 0 ? "mb-6 mt-2 mx-4" : "hidden"}
                >
                  <h4 className="text-lg font-semibold mb-2">Uploaded Files</h4>
                  <hr className="mb-4" />
                  <ScrollArea
                    className={
                      files && files.length > 5
                        ? "h-80 bg-card border border-border rounded-xl py-3 px-3"
                        : ""
                    }
                  >
                    <ul className="space-y-2">
                      {files?.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                        >
                          <span className="text-sm font-medium">
                            {file?.name || "Unnamed File"}
                          </span>

                          <Trash
                            className="w-4 h-4 cursor-pointer text-red-500 hover:text-red-600 hover:scale-110"
                            onClick={() => handleDeleteFile(index)}
                          />
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              </Card>

              {/* Uploaded Files List */}
              <div className={files && files.length > 0 ? "mt-6" : "hidden"}>
                <div className="place-self-end mt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="
                      w-full sm:w-auto
                      px-8 py-4
                      rounded-2xl
                      font-semibold text-white text-base
                      bg-[#7B61FF]
                      shadow-md
                      hover:[filter:brightness(1.06)] hover:shadow-lg
                      active:scale-[0.98]
                      transition-all
                      disabled:opacity-60 disabled:cursor-not-allowed
                      cursor-pointer
                    "
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        {/* small spinner on loading */}
                        <span className="h-4 w-4 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
                        Analysing...
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2">
                        Start Analysis
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>

            </>
          ) : (
            <>
              <div className="flex items-center justify-center ">
                <div className="text-center">
                  <h1 className="tracking-tight text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent pb-4">
                    Legacy JSP to Modern React
                  </h1>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-7">
                    A comprehensive guide mapping legacy JavaServer Pages
                    features to their modern React equivalents
                  </p>
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    Analyzing your project...
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Please wait while we process your files...
                  </p>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};
