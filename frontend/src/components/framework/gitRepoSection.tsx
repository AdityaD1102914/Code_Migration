import React, { useState } from "react";
import {
  RefreshCw,
  Clock,
  Key,
  FolderGit2,
  GitBranch,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  FolderTree,
} from "lucide-react";

interface Repository {
  name: string;
  status: string;
}

interface AppInstallation {
  id: string;
  appId: string;
  installedAt: string;
  accessToken: string;
  tokenCreatedAt: string;
  tokenExpiresAt: string;
  isExpired: boolean;
  repositories: Repository[];
}

const GitRepoSection: React.FC = () => {
  const [expandedApp, setExpandedApp] = useState<string | null>("1");

  const mockApps: AppInstallation[] = [
    {
      id: "1",
      appId: "gh_app_001",
      installedAt: "2024-01-15T10:30:00Z",
      accessToken: "ghs_16C7e42F292c6912E7710c838347Ae178B4a",
      tokenCreatedAt: "2024-01-15T10:30:00Z",
      tokenExpiresAt: "2026-07-15T10:30:00Z",
      isExpired: false,
      repositories: [
        { name: "frontend-repo", status: "Start Migration" },
        { name: "backend-services", status: "Start Migration" },
      ],
    },
    {
      id: "2",
      appId: "gh_app_002",
      installedAt: "2023-12-20T14:20:00Z",
      accessToken: "ghs_24D8f53G403d7023F8821d949458Bf289C5b",
      tokenCreatedAt: "2023-12-20T14:20:00Z",
      tokenExpiresAt: "2024-01-20T14:20:00Z",
      isExpired: true,
      repositories: [
        { name: "ml-pipeline", status: "Start Migration" },
        { name: "data-processor", status: "Start Migration" },
      ],
    },
    {
      id: "3",
      appId: "gh_app_003",
      installedAt: "2024-02-10T09:15:00Z",
      accessToken: "ghs_35E9g64H514e8134G9932e050569Ch390D6c",
      tokenCreatedAt: "2024-02-10T09:15:00Z",
      tokenExpiresAt: "2026-08-10T09:15:00Z",
      isExpired: false,
      repositories: [
        { name: "analytics-dashboard", status: "Start Migration" },
        { name: "api-gateway", status: "Start Migration" },
      ],
    },
  ];

  const toggleApp = (appId: string): void => {
    setExpandedApp((prev) => (prev === appId ? null : appId));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <div className="space-y-6">
          {mockApps.map((app, index) => {
            const isExpanded = expandedApp === app.id;

            return (
              <div
                key={app.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Header - Clickable for Accordion */}
                <div
                  className=" p-5 flex  justify-between cursor-pointer bg-slate-200"
                  onClick={() => toggleApp(app.id)}
                >
                  <div className="items-center flex-wrap">
                    {/* App ID Badge */}
                    <div className="flex items-center rounded-xl font-bold text-2xl ">
                      <FolderGit2 className="w-5 h-5 mr-2" />
                      <span>{app.appId}</span>
                    </div>

                    {/* Installed At Badge */}
                    <div className="flex items-center mt-1 text-slate-700 rounded-xl italic font-medium text-md">
                      <Clock className="w-4 h-4 mr-2" />
                      <span className="text-s">
                        Installed: {formatDate(app.installedAt)}
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
                  className={`transition-all duration-500 ease-in-out ${
                    isExpanded
                      ? "max-h-[1000px] opacity-100"
                      : "max-h-0 opacity-0"
                  } overflow-hidden`}
                >
                  <div className="px-5 pt-3 pb-5">
                    {/* Token date Info  */}
                    <div className="flex justify-between mb-3">
                      <span className="text-md font-semibold text-slate-700">
                        <span className="text-slate-500">Generated:</span>{" "}
                        {formatDate(app.tokenCreatedAt)}
                      </span>
                      <span className={`text-md font-semibold text-red-500`}>
                        <span className="">Expiring:</span>{" "}
                        {formatDate(app.tokenExpiresAt)}
                      </span>
                    </div>

                    {/* Access Token Section */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex-1">
                        {/* Access Token Badge */}
                        <h4 className="text-lg font-semibold flex items-center text-slate-900">
                          <Key className="w-4 h-4 mr-2 text-slate-600" />
                          Access Token
                        </h4>

                        {/* Token Info */}
                        <div className="p-3 w-full font-medium text-sm border text-slate-700 border-slate-300 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 mt-2">
                          <span className="text-s font-mono text-slate-600">
                            sf80df80080dsf**DSFfdsf&*$%*Dfdsldf3832$@SSDH#@&^KWEH...
                          </span>
                        </div>
                      </div>
                      <div className="mt-8">
                        {/* Recreate Button */}
                        {app.isExpired ? (
                          <button className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors cursor-pointer shadow-sm hover:shadow-md">
                            <RefreshCw className="w-4 h-4" />
                            <span>Recreate</span>
                          </button>
                        ) : (
                          <button
                            disabled={true}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-200 text-slate-600 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <RefreshCw className="w-4 h-4" />
                            <span>Active</span>
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
                        <span className="text-sm text-slate-500">
                          {app.repositories.length} repos
                        </span>
                      </div>

                      <div className="overflow-x-auto bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
                        <table className="w-full min-w-[640px]">
                          <thead className="bg-slate-100">
                            <tr>
                              <th className="px-4 py-3 text-left text-slate-700 font-semibold">
                                Repository
                              </th>
                              <th className="px-4 py-3 pr-14 text-right text-slate-700  font-semibold">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {app.repositories.map((repo, repoIndex) => (
                              <tr
                                key={repoIndex}
                                className="hover:bg-white transition-colors"
                              >
                                <td className="px-4 pt-3 pb-5">
                                  <div className="flex items-center gap-3">
                                    <div className="bg-white/60 rounded-md p-2">
                                      <GitBranch className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <div>
                                      <div className="text-xl font-medium text-slate-800">
                                        {repo.name}
                                      </div>
                                      <div className="text-sm italic font-medium text-slate-500">
                                        Private repository
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-3 text-right">
                                  <div className="inline-flex items-center gap-2">
                                    <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-neutral-600 text-white rounded-lg text-md hover:opacity-95 cursor-pointer shadow-sm hover:shadow-md">
                                      <span>Start Migration</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default GitRepoSection;
