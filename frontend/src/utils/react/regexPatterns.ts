
export const REGEX_PATTERNS = {
  totalComponents: [
    /\*\*Total Components:\*\*\s*(\d+)/i,
    /\*\*Total number of components:\*\*\s*(\d+)/i,
    /Total Components?:?\s*(\d+)/i,
    /Total:?\s*(\d+)\s*components?/i,
    /(\d+)\s*total\s*components?/i,
    /components?\s*(?:found|identified|detected|count)?:?\s*(\d+)/i,
  ],
  classComponents: [
    /(\d+)\s+Class Components?/i,
    /\*\*Class Components:\*\*\s*(\d+)/i,
    /Class Components?:?\s*(\d+)/i,
    /(\d+)\s*class(?:-based)?\s*components?/i,
  ],
  functionalComponents: [
    /(\d+)\s+Functional Components?/i,
    /\*\*Functional Components:\*\*\s*(\d+)/i,
    /Functional Components?:?\s*(\d+)/i,
    /(\d+)\s*functional\s*components?/i,
    /(\d+)\s*function(?:al)?\s*components?/i,
  ],
  estimatedTimeline: [
    /\*\*Estimated migration timeline:\*\*\s*([\d.-]+)\s*weeks?/i,
    /\*\*Estimated Migration Timeline:\*\*\s*([\d.-]+)\s*weeks?/i,
    /Estimated(?:\s*Migration)?\s*Timeline:?\s*([\d.-]+)\s*weeks?/i,
    /([\d.-]+)\s*weeks?\s*(?:estimated|timeline|duration|total)/i,
    /Timeline:?\s*([\d.-]+)/i,
  ],
  riskLevel: [
    /\*\*Risk level:\*\*\s*(\w+)/i,
    /\*\*Risk Level:\*\*\s*(\w+)/i,
    /Risk\s*Level:?\s*(Low|Medium|High)/i,
    /Risk:?\s*(Low|Medium|High)/i,
  ],
  complexity: [
    /\*\*Complexity:\*\*\s*(.+?)(?:\n|$)/i,
    /\*\*Complexity breakdown:\*\*\s*(.+?)(?:\n|$)/i,
    /Complexity:?\s*(.+?)(?:\n|$)/i,
  ],
  complexityBreakdown: {
    simple: /Simple:?\s*(\d+)/i,
    medium: /Medium:?\s*(\d+)/i,
    complex: /Complex:?\s*(\d+)/i,
  },
  antiPatternsSection:
    /\*\*(?:Detected )?Anti[-\s]?[Pp]atterns:?\*\*\s*([\s\S]*?)(?=\n\*\*[A-Z]|\n\nPhase|$)/i,
  recommendedStrategiesSection:
    /\*\*Recommended (?:Migration )?Strateg(?:ies|y):?\*\*\s*([\s\S]*?)(?=\n\*\*[A-Z]|\n\nPhase|$)/i,
  phase: /\*{0,2}Phase\s+(\d+):\s+([^\n*]+?)\*{0,2}\s*$/gim,
  phaseDescription: /Description:\s*([^\n]+)/i,
  phaseDuration: /Duration:\s*([^\n]+)/i,
  tasksSection:
    /Specific tasks based on the actual codebase:\s*([\s\S]*?)(?=\n[A-Z][^:]*:|$)/i,
  capabilitiesSection:
    /AI capabilities that will help:\s*([\s\S]*?)(?=\n[A-Z][^:]*:|$)/i,
  toolsSection: /Recommended tools:\s*([\s\S]*?)(?=\n[A-Z][^:]*:|$)/i,
  keyInsightsSection: /Key insights and recommendations:\s*([\s\S]*?)$/i,
  listItem: [/^\d+\.\s+/, /^[-*•]\s+/],
};


export const GITHUB_URL_PATTERNS = [
  /github\.com\/([^\/]+)\/([^\/]+)/,
  /^([^\/]+)\/([^\/]+)$/,
];
