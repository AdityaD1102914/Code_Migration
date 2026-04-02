const apiUrl = import.meta.env.VITE_API_BASE_URL;

export const ENDPOINTS = {
  //Auth
  login: `${apiUrl}auth/login`, //POST
  //User
  user: `${apiUrl}users`,
  //Git spcific
  gitConnect: `${apiUrl}github/connect`, //GET
  saveInstallation: `${apiUrl}github/save-installation`, //POST
  gitInstalledApps: `${apiUrl}github/installed-apps`, //POST
  gitRepos: `${apiUrl}github/repos`, //GET (Te unique Id for each object, not installationId)
  generateGitAccessToken: `${apiUrl}github/generateAccessToken`, //POST
  // Get git repos details
  gitReposAccountDetails: `${apiUrl}github/installed-apps`, //GET
};
