import React, { memo, useEffect, useState } from "react";
import { GitBranch, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const ExistingRepos: React.FC<{ reposData: any[] }> = ({ reposData }) => {
  return (
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
          {reposData?.map((repo: any, repoIndex: any) => (
            <tr key={repoIndex} className="hover:bg-white transition-colors">
              <td className="px-4 pt-3 pb-5">
                <div className="flex items-center gap-3">
                  <div className="bg-white/60 rounded-md p-2">
                    <GitBranch className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <Link
                      to={{
                        pathname: "/repos-files",
                        search: `?repo=${repo?.name}&owner=${repo?.owner?.login}`,
                      }}
                    >
                      <div className="text-xl font-medium text-slate-800">
                        {repo?.name}
                      </div>
                      <div className="text-sm italic font-medium text-slate-500">
                        {repo?.private
                          ? "Private repository"
                          : "Public repository"}
                      </div>
                    </Link>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <Link
                      to={{
                        pathname: "/repos-files",
                        search: `?repo=${repo?.name}&owner=${repo?.owner?.login}`,
                      }}
                    >

                  <button className="inline-flex items-center gap-2 px-3 py-2.5 bg-neutral-600 text-white rounded-lg text-md hover:opacity-95 cursor-pointer shadow-sm hover:shadow-md">
                    <span>Start Analysis</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                    </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default memo(ExistingRepos);
