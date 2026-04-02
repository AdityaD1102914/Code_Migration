import axios from 'axios';

// GitHub API base URL
const GITHUB_API = 'https://api.github.com';
const GITHUB_RAW = 'https://raw.githubusercontent.com';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

const githubHeaders = GITHUB_TOKEN
  ? { Authorization: `Bearer ${GITHUB_TOKEN}` }
  : {};

// Parse GitHub URL to extract owner, repo, and branch
export function parseGithubUrl(url: string): { owner: string; repo: string; branch: string } | null {
  try {
    // Remove trailing slash
    url = url.trim().replace(/\/$/, '');
    
    // Match patterns like:
    // https://github.com/owner/repo
    // https://github.com/owner/repo/tree/branch
    const regex = /github\.com\/([^\/]+)\/([^\/]+)(?:\/tree\/([^\/]+))?/;
    const match = url.match(regex);
    
    if (!match) return null;
    
    const owner = match[1];
    const repo = match[2].replace('.git', ''); // Remove .git if present
    const branch = match[3] || 'main'; // Default to 'main' if no branch specified
    
    return { owner, repo, branch };
  } catch (error) {
    console.error('Error parsing GitHub URL:', error);
    return null;
  }
}

// Validate if URL is a valid GitHub repository URL
export function isValidGithubUrl(url: string): boolean {
  const parsed = parseGithubUrl(url);
  return parsed !== null;
}

// Fetch repository information
export async function fetchRepoInfo(owner: string, repo: string) {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, { headers: githubHeaders });
    return {
      success: true,
      data: response.data,
      defaultBranch: response.data.default_branch
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch repository info'
    };
  }
}

// Fetch repository file tree
export async function fetchRepoTree(owner: string, repo: string, branch: string = 'main') {
  try {
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: githubHeaders }
    );
    
    // Filter only code files
    const codeExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json'];
    const files = response.data.tree.filter((item: any) => {
      if (item.type !== 'blob') return false;
      return codeExtensions.some(ext => item.path.endsWith(ext));
    });
    
    return {
      success: true,
      files: files.map((file: any) => ({
        path: file.path,
        sha: file.sha,
        size: file.size,
        url: file.url
      }))
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch repository tree'
    };
  }
}

// Fetch single file content
export async function fetchFileContent(owner: string, repo: string, branch: string, filepath: string) {
  try {
    // Use GitHub Contents API instead of raw URL to avoid CORS issues
    const response = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filepath}?ref=${branch}`,
      { headers: githubHeaders }
    );
    // GitHub Contents API returns base64 encoded content
    const content = atob(response.data.content.replace(/\n/g, ''));
    return {
      success: true,
      content,
      path: filepath
    };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to fetch ${filepath}`,
      path: filepath
    };
  }
}

// Fetch multiple files content
export async function fetchMultipleFiles(
  owner: string,
  repo: string,
  branch: string,
  filepaths: string[]
) {
  try {
    const promises = filepaths.map(filepath =>
      fetchFileContent(owner, repo, branch, filepath)
    );
    
    const results = await Promise.all(promises);
    
    const successfulFiles = results.filter(r => r.success);
    const failedFiles = results.filter(r => !r.success);
    
    return {
      success: true,
      files: successfulFiles.map(f => ({
        path: f.path,
        content: f.content
      })),
      failed: failedFiles.map(f => f.path),
      total: filepaths.length,
      fetched: successfulFiles.length
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch files',
      files: [],
      failed: filepaths,
      total: filepaths.length,
      fetched: 0
    };
  }
}

// Main function to get repository files for migration
export async function getRepoForMigration(githubUrl: string) {
  // Parse URL
  const parsed = parseGithubUrl(githubUrl);
  if (!parsed) {
    return {
      success: false,
      error: 'Invalid GitHub URL'
    };
  }
  
  const { owner, repo, branch } = parsed;
  
  // Fetch repo info to get default branch
  const repoInfo = await fetchRepoInfo(owner, repo);
  if (!repoInfo.success) {
    return repoInfo;
  }
  
  const actualBranch = branch === 'main' ? repoInfo.defaultBranch : branch;
  
  // Fetch file tree
  const tree = await fetchRepoTree(owner, repo, actualBranch);
  if (!tree.success) {
    return tree;
  }
  
  return {
    success: true,
    owner,
    repo,
    branch: actualBranch,
    files: tree.files,
    repoInfo: {
      name: repoInfo.data.name,
      description: repoInfo.data.description,
      stars: repoInfo.data.stargazers_count,
      language: repoInfo.data.language
    }
  };
}
