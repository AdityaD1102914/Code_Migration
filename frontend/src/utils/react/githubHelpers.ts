import {
  shouldProcessFile,
  shouldIgnoreDirectory,
  getContentType,
  addPathToFile,
} from "./fileFilterUtils";
import { GITHUB_URL_PATTERNS } from "./regexPatterns";

const GITHUB_API_BASE = "https://api.github.com";

/**
 * Fetch contents of a GitHub repository recursively
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} path - Path within repository (default: '')
 * @returns {Promise<File[]>} - Array of File objects
 */
export async function traverseGitHubRepo(owner, repo, path = "") {
  const files = [];

  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(
          "Repository not found. Please check the URL and ensure the repository is public."
        );
      } else if (response.status === 403) {
        const rateLimitRemaining = response.headers.get(
          "X-RateLimit-Remaining"
        );
        if (rateLimitRemaining === "0") {
          throw new Error(
            "GitHub API rate limit exceeded. Please try again later or authenticate with a GitHub token."
          );
        }
        throw new Error(
          "Access forbidden. The repository might be private or you need authentication."
        );
      } else {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
      }
    }

    const contents = await response.json();

    // Handle case where contents is not an array (single file)
    if (!Array.isArray(contents)) {
      return files;
    }

    for (const item of contents) {
      // Skip if it's in an ignored directory
      if (shouldIgnoreDirectory(item.path)) {
        continue;
      }

      if (item.type === "file") {
        // Check if file should be processed
        if (shouldProcessFile(item.path)) {
          try {
            const fileContent = await fetchFileContent(item.download_url);

            // Create a File-like object
            const file = new File([fileContent], item.name, {
              type: getContentType(item.name),
            });

            // Add path property for display
            addPathToFile(file, item.path);

            // Add content property for direct access
            Object.defineProperty(file, "content", {
              value: fileContent,
              writable: false,
              enumerable: true,
            });

            files.push(file);
          } catch (error) {
            console.warn(`Failed to fetch file ${item.path}:`, error);
          }
        }
      } else if (item.type === "dir") {
        // Recursively traverse subdirectories
        try {
          const subFiles = await traverseGitHubRepo(owner, repo, item.path);
          files.push(...subFiles);
        } catch (error) {
          console.warn(`Failed to traverse directory ${item.path}:`, error);
        }
      }
    }

    // console.log('Final files data: ', files);
    return files;
  } catch (error) {
    console.error("Error traversing GitHub repository:", error);
    throw error;
  }
}

/**
 * Fetch file content from GitHub
 * @param {string} downloadUrl - Direct download URL
 * @returns {Promise<string>} - File content
 */
async function fetchFileContent(downloadUrl) {
  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch file: ${response.status} ${response.statusText}`
      );
    }

    return await response.text();
  } catch (error) {
    console.error("Error fetching file content:", error);
    throw error;
  }
}

/**
 * Parse GitHub repository URL
 * @param {string} url - GitHub URL
 * @returns {Object|null} - {owner, repo} or null
 */

export function parseGitHubUrl(url) {
  for (const pattern of GITHUB_URL_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      };
    }
  }
  return null;
}


/**
 * Validate GitHub repository URL
 * @param {string} url - GitHub URL
 * @returns {boolean} - True if valid
 */
export function isValidGitHubUrl(url) {
  return parseGitHubUrl(url) !== null;
}

/**
 * Get repository information
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} - Repository information
 */
export async function getRepoInfo(owner, repo) {
  try {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch repository info: ${response.status}`);
    }

    const data = await response.json();

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      updatedAt: data.updated_at,
      defaultBranch: data.default_branch,
      size: data.size,
      openIssues: data.open_issues_count,
    };
  } catch (error) {
    console.error("Error fetching repository info:", error);
    throw error;
  }
}

/**
 * Check GitHub API rate limit
 * @returns {Promise<Object>} - Rate limit info
 */
export async function checkRateLimit() {
  try {
    const url = `${GITHUB_API_BASE}/rate_limit`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Failed to check rate limit");
    }

    const data = await response.json();

    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
      used: data.rate.used,
    };
  } catch (error) {
    console.error("Error checking rate limit:", error);
    return null;
  }
}
