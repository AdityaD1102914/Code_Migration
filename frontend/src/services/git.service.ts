import { ENDPOINTS } from "../config/api.config";
import axiosInstance from "../config/axiosInstance";
// All github related services



export const connectToGit = async () => {
    const resp = await axiosInstance.get(ENDPOINTS.gitConnect);
    return resp.data;
}

export const saveInstalledGitAppInfo = async (body: { installation_id: string }) => {
    const resp = await axiosInstance.post(ENDPOINTS.saveInstallation, body);
    return resp.data;
}

export const generateAccessTokenForInstalledApp = async (installationId: string) => {
    const tokenResp = await axiosInstance.get(`${ENDPOINTS.generateGitAccessToken}/${installationId}`);
    return tokenResp.data;
}

export const getGitRepoAccountDetails = async (userId: string) => {
    const accounResp = await axiosInstance.get(`${ENDPOINTS.gitReposAccountDetails}?userId=${userId}`);
    return accounResp;
}

//Call this mehod once whe nsetting upda the app after generating access_token and whenever need to refetch the repos after any 
// configuration changes or repos access changes for the installed github app.
export const fetchAccessdReposAndSaveToDB = async (appId: string) => {
    const resp = await axiosInstance.get(`${ENDPOINTS.gitRepos}/${appId}`);
    return resp.data;
}