import { memo, useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchAccessdReposAndSaveToDB, generateAccessTokenForInstalledApp, saveInstalledGitAppInfo } from "../../services/git.service";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const GithubCallback = () => {
    const [instId, setInstId] = useState<string | null>(null)
    const [searchParams, setSearchParams] = useSearchParams();
    const [appDetails, setAppDetals] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(true);
        const inst_Id = searchParams.get('installation_id');
        if (!inst_Id) {
            setError('No installation ID received from GitHub');
            setLoading(false)
            return 
        }
        setError(null)
        setInstId(inst_Id);
        saveInstalledApp(inst_Id as string);
        

    }, [instId])


    //Save InsatlledApp
     const saveInstalledApp = async (intId: string) => {
        if (!instId) {
            setError('No installation ID received from GitHub');
            setLoading(false)
            return;
        }
        try {
            const resp = await saveInstalledGitAppInfo({ installation_id: intId });
            if (resp && resp.data?.installationId) {
                await getAccessTokenForInstId(resp.data?.installationId, resp.data?._id);
            }
        } catch (e) {
            console.log('error in saving app', e)
            setError('error in saving app');
            setLoading(false)
        }

    }

    //Generate AccessToken
    const getAccessTokenForInstId = async (inst_Id: string, appId: string) => {
        try {
            const tokenResp = await generateAccessTokenForInstalledApp(inst_Id);
            if (tokenResp) {
                await fetchAccessdReposAndSaveToDB(appId);
                setAppDetals(tokenResp.data);
                setLoading(false);
                navigate('/project')
            }
        } catch (e) {
            setError(`error in generating token for ${inst_Id}`);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
                    {loading && (
                        <div className="text-center">
                            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Processing Authentication
                            </h2>
                            <p className="text-gray-600">
                                Please wait while we complete your GitHub authentication...
                            </p>
                        </div>
                    )}

                    {appDetails && (
                        <div className="text-center">
                            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Authentication Successful!
                            </h2>
                            <p className="text-gray-600 mb-4">You can close this window now.</p>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded transition"
                                onClick={() => window.close()}
                            >
                                Close Window
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="text-center">
                            <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Authentication Failed
                            </h2>
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded transition"
                                onClick={() => window.close()}
                            >
                                Close Window
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default memo(GithubCallback);