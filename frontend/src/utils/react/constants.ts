// constants.js

export const PRIORITY_KEYWORDS = {
  high: [
    "major",
    "critical",
    "huge",
    "immediate",
    "security",
    "vulnerability",
    "must",
    "urgent",
    "risk",
    "danger",
  ],
  medium: ["should", "important", "consider", "recommend", "improve"],
};

export const SEVERITY_KEYWORDS = {
  critical: [
    "critical",
    "severe",
    "dangerous",
    "security",
    "vulnerability",
    "breaking",
  ],
  high: ["major", "significant", "important", "memory leak", "performance"],
  medium: ["moderate", "should", "consider", "warning"],
};

export const COMPLEXITY_LEVELS = {
  SIMPLE: ["simple", "low"],
  MEDIUM: ["medium"],
  COMPLEX: ["complex", "high"],
};

export const STRATEGY_CATEGORIES = {
  INCREMENTAL: ["incremental", "gradual"],
  BIG_BANG: ["big bang", "complete rewrite"],
  PARALLEL: ["parallel", "strangler"],
  COMPONENT_BASED: ["component", "module"],
};

export const IMPACT_TYPES = {
  PERFORMANCE: "performance",
  SECURITY: "security",
  MAINTAINABILITY: ["maintainability", "maintenance"],
  SCALABILITY: "scalability",
  ACCESSIBILITY: "accessibility",
};

export const DEFAULT_VALUES = {
  RISK_LEVEL: "Unknown",
  ESTIMATED_TIME: "1-2 weeks",
  COMPLEXITY: { simple: 0, medium: 0, complex: 0 },
  MIN_ITEM_LENGTH: 10,
  MAX_TITLE_LENGTH: 60,
};

export const PHASE_SECTIONS = [
  { category: "task", priority: "high" },
  { category: "capability", priority: "medium" },
  { category: "tool", priority: "low" },
  { category: "insight", priority: "medium" },
];

 export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
 export const FRAMEWORK_CONFIG= {
  react: {
    name: "React",
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json",".scss", ".css", ".html"],
    specialFiles: ["package.json"],
    uploadTitle: "Upload Your Entire React Project",
    githubDescription:
      "Enter a GitHub repository URL to analyze your React project",
    githubNote:
      "We'll fetch all relevant files including package.json for complete analysis",
    acceptAttr: ".js,.jsx,.tsx,.ts,.json",
  },
  angular: {
    name: "Angular",
    extensions: [".ts", ".html", ".scss", ".css", ".json"],
    specialFiles: ["package.json", "angular.json"],
    uploadTitle: "Upload Your Entire Angular Project",
    githubDescription:
      "Enter a GitHub repository URL to analyze your Angular project",
    githubNote:
      "We'll fetch all relevant files including angular.json and package.json for complete analysis",
    acceptAttr: ".ts,.html,.scss,.css,.json",
  },
    jsp: {
    name: "JSP",
    extensions: [
      ".jsp",
      ".jspx",
      ".jspf",
      ".html",
      ".htm",
      ".css",
      ".js",
      ".xml",
      ".properties"
    ],
    specialFiles: [
      "web.xml", // Deployment descriptor
      "application.properties"
    ],
    uploadTitle: "Upload Your JSP Web Project (ZIP only)",
    githubDescription:
      "Enter a GitHub repository URL to analyze your JSP-based project",
    githubNote:
      "We'll fetch JSP views, HTML, CSS, JS, and config files like web.xml for complete analysis",
    acceptAttr: ".zip",
    zipOnly: true
  }
};