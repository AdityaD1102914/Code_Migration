import React, { useEffect, useState } from "react";
import {
  RefreshCw,
  Clock,
  Key,
  FolderGit2,
  GitBranch,
  ChevronDown,
  ChevronUp,
  FolderTree,
} from "lucide-react";
import ExistingRepos from "./ExistingReos";
import {
  fetchAccessdReposAndSaveToDB,
  generateAccessTokenForInstalledApp,
  getGitRepoAccountDetails,
  saveInstalledGitAppInfo,
} from "../../services/git.service";
import { useSelector } from "react-redux";
import { formatDate } from "../../utils/react/constants";
import useToaster from "../../hooks/useToaster";

interface Repository {
  name: string;
  status: string;
}

interface AppInstallation {
  id: string;
  _id: string;
  appId: string;
  installationId: string;
  updatedAt: string;
  installedAt: string;
  accessToken: string;
  createdAt: string;
  tokenExpiresAt: string;
  isExpired: boolean;
  repositories: Repository[];
  githubToken: {
    expires_at: string;
    token: string;
  };
  reposData: {
    repositories: Repository[];
  };
}

const GitEnvironment: React.FC = () => {
  const [expandedApp, setExpandedApp] = useState<string | null>("1");
  const [loading, setLoading] = useState(true);
  const [isTokenActive, setIsTokenActive] = useState(true);
  const [repoDetails, setRepoDetails] = useState<AppInstallation[]>([]);
  const { loggedInUserInfo } = useSelector((state: any) => state.auth);
  const { showSuccessToast, showErrorToast } = useToaster();

  const toggleApp = (appId: string): void => {
    setExpandedApp((prev) => (prev === appId ? null : appId));
  };

  const GetRepoAccountDetails = async () => {
    setLoading(true);
    let response = await getGitRepoAccountDetails(loggedInUserInfo?._id);
    setRepoDetails(response?.data?.data || []);
    setLoading(false);
  };

  const generateAccessToken = async (installationId: string) => {
    try {
      setIsTokenActive(false);
      await generateAccessTokenForInstalledApp(installationId);
      GetRepoAccountDetails();
      setIsTokenActive(true);
      showSuccessToast("Access token generated successfully");
    } catch (error) {
      setIsTokenActive(true);
      showErrorToast("Failed to generate access token");
    }
  };

  //Save InsatlledApp
  const refreshGitRepos = async (appId: string) => {
    if (!appId) {
      setLoading(false);
      return;
    }
    await fetchAccessdReposAndSaveToDB(appId);
    let response = await getGitRepoAccountDetails(loggedInUserInfo?._id);
    setRepoDetails(response?.data?.data || []);
    showSuccessToast("Repository refreshed successfully");
  };

  useEffect(() => {
    if (loggedInUserInfo?._id) {
      GetRepoAccountDetails();
    } else {
      setLoading(false);
    }
  }, [loggedInUserInfo]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">
            Installed Apps
          </h1>
          <p className="text-slate-600 text-lg">
            Manage your GitHub app installations
          </p>
        </div>

        {/* App Cards */}
        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading...</div>
        ) : repoDetails?.length ? (
          <div className="space-y-6">
            {repoDetails.map((app, index) => {
              const isExpanded = expandedApp === app?._id;

              return (
                <div
                  key={app?._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header - Clickable for Accordion */}
                  <div
                    className=" p-5 flex  justify-between cursor-pointer bg-slate-200"
                    onClick={() => toggleApp(app?._id)}
                  >
                    <div className="items-center flex-wrap">
                      {/* App ID Badge */}
                      <div className="flex items-center rounded-xl font-bold text-2xl ">
                        <FolderGit2 className="w-5 h-5 mr-2" />
                        <span>{app?._id}</span>
                      </div>

                      {/* Installed At Badge */}
                      <div className="flex items-center mt-1 text-slate-700 rounded-xl italic font-medium text-md">
                        <Clock className="w-4 h-4 mr-2" />
                        <span className="text-s">
                          Installed: {formatDate(app?.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Accordion Toggle Icon */}
                      <div className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors duration-200">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-700 transition-transform duration-300" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-700 transition-transform duration-300" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body - Accordion Content */}
                  <div
                    className={`transition-all duration-500 ease-in-out ${isExpanded
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                      } overflow-hidden`}
                  >
                    <div className="px-5 pt-3 pb-5">
                      {/* Access Token Section */}
                      {/* Access Token Badge */}
                      <h4 className="text-lg font-semibold flex items-center text-slate-900">
                        <Key className="w-4 h-4 mr-2 text-slate-600" />
                        Access Token
                      </h4>
                      {/* Token date Info  */}
                      <div className="flex justify-between">
                        <span className="text-md font-semibold text-slate-700">
                          <span className="text-slate-500">Generated:</span>{" "}
                          {formatDate(app?.updatedAt)}
                        </span>
                        <span className={`text-md font-semibold text-red-500`}>
                          <span className="">Expiring:</span>{" "}
                          {formatDate(app?.githubToken?.expires_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          {/* Token Info */}
                          <div className="p-3 w-full font-medium text-sm border text-slate-700 border-slate-300 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 mt-2">
                            <span className="text-s font-mono text-slate-600">
                              {app?.githubToken?.token}
                            </span>
                          </div>
                        </div>
                        <div className="self-end mb-1">
                          {/* Recreate Button */}
                          {new Date(app?.githubToken?.expires_at) <
                            new Date() && (
                              <button
                                onClick={() =>
                                  generateAccessToken(app?.installationId)
                                }
                                disabled={!isTokenActive}
                                className={`inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-sm hover:shadow-md${!isTokenActive
                                  ? " opacity-50  cursor-not-allowed"
                                  : ""
                                  }`}
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>
                                  {isTokenActive ? "Recreate" : "Generating..."}
                                </span>
                              </button>
                            )}
                        </div>
                      </div>
                      <hr className="mt-4 text-slate-300" />
                      {/* Accessed Repos Section */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-semibold flex items-center text-slate-900">
                            <FolderTree className="w-4 h-4 mr-2 text-slate-600" />{" "}
                            Existing Repos
                          </h4>
                          {/* Refresh Repos */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-500">
                              {app?.reposData?.repositories?.length} repos
                            </span>
                            <RefreshCw
                              onClick={() => refreshGitRepos(app?._id)}
                              className="w-7 h-7 bg-blue-600 p-1.5 rounded text-white cursor-pointer hover:bg-blue-700 hover:scale-105"
                            />
                          </div>
                        </div>
                        {/* Existing Repos Section */}
                        <ExistingRepos
                          reposData={app?.reposData?.repositories || []}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-600">
            No installed apps found.
          </div>
        )}
      </div>
    </div>
  );
};

export default GitEnvironment;
