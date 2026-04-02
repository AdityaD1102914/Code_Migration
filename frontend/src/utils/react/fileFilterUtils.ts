
export const RELEVANT_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".html", ".scss", ".css", ".json"];

// Important files that should always be processed
export const IMPORTANT_FILES = [
  "package.json",
  "package-lock.json",
  "yarn.lock",
];

// Directories to ignore during traversal
export const IGNORED_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  ".next",
  "out",
  ".cache",
  "public",
  "assets",
  ".vscode",
  ".idea",
  "__pycache__",
  "venv",
  ".github",
  "docs",
  ".nuxt",
  ".output",
  "target",
  "bower_components",
  ".sass-cache",
  ".tmp",
  "tmp",
  "temp",
];

/**
 * Check if a file should be processed based on its path
 * @param {string} filePath - The file path to check
 * @returns {boolean} - True if file should be processed
 */
export function shouldProcessFile(filePath) {
  const fileName = filePath.split("/").pop().split("\\").pop();

  // Check if it's an important file
  if (IMPORTANT_FILES.includes(fileName)) {
    return true;
  }

  // Check if it has a relevant extension
  const hasRelevantExtension = RELEVANT_EXTENSIONS.some((ext) =>
    filePath.toLowerCase().endsWith(ext)
  );

  return hasRelevantExtension;
}

/**
 * Check if a directory path should be ignored
 * @param {string} path - The directory path to check
 * @returns {boolean} - True if directory should be ignored
 */
export function shouldIgnoreDirectory(path) {
  const pathLower = path.toLowerCase();

  return IGNORED_DIRS.some((ignored) => {
    const ignoredLower = ignored.toLowerCase();
    // Check for directory in path (with slashes or backslashes)
    return (
      pathLower.includes(`/${ignoredLower}/`) ||
      pathLower.startsWith(`${ignoredLower}/`) ||
      pathLower.includes(`\\${ignoredLower}\\`) ||
      pathLower.startsWith(`${ignoredLower}\\`) ||
      pathLower.endsWith(`/${ignoredLower}`) ||
      pathLower.endsWith(`\\${ignoredLower}`) ||
      pathLower === ignoredLower
    );
  });
}

/**
 * Filter an array of files to only include relevant files
 * @param {File[]} files - Array of File objects
 * @returns {File[]} - Filtered array of files
 */
export function filterRelevantFiles(files) {
  return files.filter((file) => {
    const filePath = file.path || file.webkitRelativePath || file.name;
    return shouldProcessFile(filePath) && !shouldIgnoreDirectory(filePath);
  });
}

/**
 * Get file statistics from an array of files
 * @param {File[]} files - Array of File objects
 * @returns {Object} - Statistics object with counts
 */
export function getFileStatistics(files) {
  const stats = {
    total: files.length,
    packageJson: 0,
    lockFiles: 0,
    js: 0,
    jsx: 0,
    ts: 0,
    tsx: 0,
    byDirectory: {},
  };

  const exactMatchMap = {
    "package.json": "packageJson",
    "package-lock.json": "lockFiles",
    "yarn.lock": "lockFiles",
  };

  const extensionMap = {
    ".js": "js",
    ".jsx": "jsx",
    ".ts": "ts",
    ".tsx": "tsx",
  };

  files.forEach((file) => {
    const fileName = file.name.toLowerCase();
    const filePath = file.path || file.webkitRelativePath || file.name;

    // Count by exact file name
    const exactKey = exactMatchMap[fileName];
    if (exactKey) {
      stats[exactKey]++;
    } else {
      // Count by extension
      const ext = Object.keys(extensionMap).find((e) => fileName.endsWith(e));
      if (ext) stats[extensionMap[ext]]++;
    }

    // Count by directory
    const directory =
      filePath.split("/")[0] || filePath.split("\\")[0] || "root";
    stats.byDirectory[directory] = (stats.byDirectory[directory] || 0) + 1;
  });

  return stats;
}

/**
 * Check if package.json exists in file array
 * @param {File[]} files - Array of File objects
 * @returns {boolean} - True if package.json exists
 */
export function hasPackageJson(files) {
  return files.some((f) => f.name === "package.json");
}

/**
 * Get the package.json file from array
 * @param {File[]} files - Array of File objects
 * @returns {File|null} - Package.json file or null
 */
export function getPackageJsonFile(files) {
  return files.find((f) => f.name === "package.json") || null;
}

/**
 * Get content type for a file based on extension
 * @param {string} filename - The filename
 * @returns {string} - MIME type
 */
export function getContentType(filename) {
  const ext = filename.split(".").pop().toLowerCase();

  const contentTypes = {
    js: "text/javascript",
    jsx: "text/javascript",
    ts: "text/typescript",
    tsx: "text/typescript",
    json: "application/json",
    lock: "text/plain",
    html: "text/html",
    scss: "text/x-scss",
    css: "text/css",
  };

  return contentTypes[ext] || "text/plain";
}

/**
 * Create a displayable file path (shortened if too long)
 * @param {string} path - Full file path
 * @param {number} maxLength - Maximum length (default: 50)
 * @returns {string} - Shortened path
 */
export function getDisplayPath(path, maxLength = 50) {
  if (path.length <= maxLength) return path;

  const parts = path.split("/");
  if (parts.length <= 2) return path;

  const fileName = parts[parts.length - 1];
  const firstDir = parts[0];

  if (firstDir.length + fileName.length + 5 < maxLength) {
    return `${firstDir}/.../${fileName}`;
  }

  return `.../${fileName}`;
}

/**
 * Add path property to a File object
 * @param {File} file - The File object
 * @param {string} path - The path to add
 * @returns {File} - File with path property
 */
export function addPathToFile(file, path) {
  if (!file.path && path) {
    Object.defineProperty(file, "path", {
      value: path,
      writable: false,
      enumerable: true,
    });
  }
  return file;
}
