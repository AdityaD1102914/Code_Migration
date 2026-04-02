import React, { useEffect } from "react";
import { Toaster } from "@/LegacyLift/components/ui/toaster";
import { Toaster as Sonner } from "@/LegacyLift/components/ui/sonner";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ConversionPage from "./pages/react/conversion/ConversionPage";
import AngularConversionPage from "./pages/react/conversion/angular-conversion-page";
import ReactMigration from "./pages/react/migration/ReactMigration";
import AngularMigration from "./pages/react/migration/angular-migration";
import AnalysisPage from "./pages/react/analysis/AnalysisPage";
import AngularAnalysisPage from "./pages/react/analysis/angular-analysis-page";
import LandingPage from "./pages/LandingPage";
import ProjectUpload from "./pages/ProjectUpload";
import ReviewWorkflow from "./pages/react/review/ReviewWorkflow";
import { useDispatch, useSelector } from "react-redux";
import Login from "./auth/login";
import NotFound from "./auth/notfound";
import { checkIsLoggedIn } from "./store/slices/auth.slice";
import AxiosInterceptorWrapper from "./wrappers/AxiosInterceptorwrapper";

import ReactResultsSection from "./components/analysis/ResultSection";
import AngularAnalysisResults from "./components/analysis/angular-result-section";

// import TestComponent from "./pages/github-auth/test";

// Latest Imports
import AnalysisReport from "./LegacyLift/pages/analysisUI";
import UploadProject from "./LegacyLift/pages/upload";
import { AppProvider } from "./LegacyLift/contexts/useContext";
import { StepProvider } from "./LegacyLift/contexts/useStepContext";
import MigrationUI from "./LegacyLift/pages/migrationUI";

import GitCallBack from "./pages/git/GitCallBack";
import ToasterProvider from "./contexts/ToasterContext";
import GitEnvironment from "./pages/git";
import RepoFiles from "./pages/git/repoFiles";
import Backbutton from "./components/backbutton";
import ConversionResultUI from "./components/conversionResultUI";
import PublicRepoMigration from "./pages/PublicRepoMigration";
function App() {

  const { isLoggedIn,
    authToken,
    isLoginInProcess,
    error } = useSelector((state: any) => state.auth)
  const dispatch = useDispatch();

  useEffect(() => {
    //Check for login
    dispatch(checkIsLoggedIn());
  }, [])



  return (
    <AppProvider>
      <StepProvider>
        <Toaster />
        <ToasterProvider>
          <Router>
            <AxiosInterceptorWrapper>
              <Navbar />
              <Backbutton />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/public-repo-migration" element={<PublicRepoMigration />} />
                <Route path="/conversion-migration" element={<ConversionResultUI />} />
                <Route path="/repos-files" element={<RepoFiles />} />

                {/* Protect everything else */}
                {isLoggedIn && authToken && (
                  <>
                    <Route path="/project" element={<ProjectUpload />} />
                    {/* <Route path="/installed" element={<GithubCallback />} /> */}
                    <Route path="/react-migration" element={<ReactMigration />} />
                    <Route path="/github/callback" element={<GitCallBack />} />
                    <Route path="/angular-migration" element={<AngularMigration />} />
                    <Route path="/react-analysis" element={<AnalysisPage />} />
                    <Route path="/angular-analysis" element={<AngularAnalysisPage />} />
                    <Route path="/react-conversion" element={<ConversionPage />} />
                    <Route path="/angular-conversion" element={<AngularConversionPage />} />
                    <Route path="/review" element={<ReviewWorkflow />} />
                    <Route path="/gitrepos" element={<GitEnvironment />} />
                    <Route path="/repos-files" element={<RepoFiles />} />
                    <Route path="/react-analysis-result" element={<ReactResultsSection />} />
                    <Route path="/angular-analysis-result" element={<AngularAnalysisResults />} />


                    {/* JSP → React upload page */}
                    <Route path="/upload" element={<UploadProject />} />
                    <Route path="/analysis" element={<AnalysisReport />} />
                    <Route path="/migration" element={<MigrationUI />} />
                    <Route path="/conversion-migration" element={<ConversionResultUI />} />
                  </>
                )}

                {/* Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AxiosInterceptorWrapper>
          </Router>
        </ToasterProvider>
      </StepProvider>
    </AppProvider>
  );

}

export default App;
