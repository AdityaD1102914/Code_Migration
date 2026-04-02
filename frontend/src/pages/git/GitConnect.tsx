import { GitBranch, Link, Link2 } from "lucide-react";
import { memo, useCallback, useState } from "react";
import { connectToGit } from "../../services/git.service";
import { useNavigate } from "react-router-dom";

const GitConnect = () => {
  const [gitAppUrl, setGitAppUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const initializeGitConnect = useCallback(
    (appUrl: string) => {
      console.log("Inside callback!!!!");
      if (appUrl) {
        const popup = window.open(appUrl, "_blank", "popup");
        if (!popup) {
          //Use Toster here
          console.log("No access of popup!!");
          // showMessage("error", "Popup blocked! Please allow popups for this site.");
        } else {
          console.log(
            "Please complete the GitHub authentication in the popup window!!"
          );
          // showMessage(
          //     "info",
          //     "Please complete the GitHub authentication in the popup window."
          // );
        }
      }
    },
    [gitAppUrl]
  );

  //Get Git App Connect Url
  const getGitAppUrl = async () => {
    const urlResp = await connectToGit();
    if (urlResp) {
      setGitAppUrl(urlResp.data);
      initializeGitConnect(urlResp.data);
    }
  };

  // Existing Repo Handler
  const handleExistingRepo = () => {
    navigate("/gitrepos");
  };

  // Public Repo URL Handler
  const handlePublicRepoUrl = () => {
    navigate("/public-repo-migration");
  };

  return (
    <>
      <div>
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <GitBranch className="w-12 h-12 text-white" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Add Your Github Repo
          </h3>
          {/* <p className="text-gray-600 mb-4">Desc</p> */}
          {/* <p className="text-sm text-gray-500 mb-8">Note</p> */}
          <div className="flex-1 flex justify-center items-center gap-3">
            {/* Connect New Repo Button */}
            <button
              className="bg-gradient-to-r from-gray-800
                 to-gray-900 text-white px-8 py-4 
                 rounded-lg font-semibold hover:from-gray-900
                  hover:to-black transition flex items-center
                   justify-center cursor-pointer"
              onClick={getGitAppUrl}
            >
              <GitBranch className="w-5 h-5 mr-2" />
              Connect New Repo
            </button>
            
            <div className="text-gray-400 font-semibold">OR</div>
            
            {/* Existing Repos Button */}
            <button
              className="bg-gradient-to-r from-gray-800
                 to-gray-900 text-white px-8 py-4 
                 rounded-lg font-semibold hover:from-gray-900
                  hover:to-black transition flex items-center
                   justify-center cursor-pointer"
              onClick={handleExistingRepo}
            >
              <GitBranch className="w-5 h-5 mr-2" />
              Existing Repos
            </button>
            
            <div className="text-gray-400 font-semibold">OR</div>
            
            {/* Public Repo URL Button (NEW) */}
            <button
              className="bg-gradient-to-r from-green-600
                 to-green-700 text-white px-8 py-4 
                 rounded-lg font-semibold hover:from-green-700
                  hover:to-green-800 transition flex items-center
                   justify-center cursor-pointer"
              onClick={handlePublicRepoUrl}
            >
              <Link2 className="w-5 h-5 mr-2" />
              Public Repo URL
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(GitConnect);
