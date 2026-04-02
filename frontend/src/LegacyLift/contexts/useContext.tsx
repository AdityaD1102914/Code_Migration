import React, { createContext, useContext, useState, ReactNode } from "react";
import { ProjectFile } from "@/LegacyLift/types/fileExplorerType";
import { FeatureMapping, Improvement, AnalysisData } from "@/LegacyLift/types/analysis";

type UploadedFile = ProjectFile;
type ProjectJsonType = { files: UploadedFile[] } | null;



type MigrationReportType = [FeatureMapping[], Improvement[]] | null;

interface AppContextType {
  uploadedFileContext: UploadedFile[] | null;
  setUploadedFileContext: React.Dispatch<
    React.SetStateAction<UploadedFile[] | null>
  >;
  projectJson: ProjectJsonType;
  setProjectJson: React.Dispatch<React.SetStateAction<ProjectJsonType>>;
  migrationReportJson: MigrationReportType;
  setMigrationReportJson: React.Dispatch<
    React.SetStateAction<MigrationReportType>
  >;
  analysisReportJson: AnalysisData[] | null;
  setAnalysisReportJson: React.Dispatch<
    React.SetStateAction<AnalysisData[] | null>
  >;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [uploadedFileContext, setUploadedFileContext] = useState<
    UploadedFile[] | null
  >(null);
  const [projectJson, setProjectJson] = useState<ProjectJsonType>(null);
  const [migrationReportJson, setMigrationReportJson] =
    useState<MigrationReportType>(null);
  const [analysisReportJson, setAnalysisReportJson] =
    useState<AnalysisData[] | null>(null);
    

  return (
    <AppContext.Provider
      value={{
        uploadedFileContext,
        setUploadedFileContext,
        projectJson,
        setProjectJson,
        migrationReportJson,
        setMigrationReportJson,
        analysisReportJson,
        setAnalysisReportJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
};
