import { REGEX_PATTERNS } from "./regexPatterns";
import {
  PRIORITY_KEYWORDS,
  SEVERITY_KEYWORDS,
  COMPLEXITY_LEVELS,
  STRATEGY_CATEGORIES,
  IMPACT_TYPES,
  DEFAULT_VALUES,
  PHASE_SECTIONS,
} from "./constants";

const safeParseInt = (value, defaultValue = 0) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

const matchFirst = (text, patterns) => {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match;
  }
  return null;
};

export function parseAIResult(responseText) {
  const totalComponentsMatch = matchFirst(
    responseText,
    REGEX_PATTERNS.totalComponents
  );
  const totalComponents = safeParseInt(totalComponentsMatch?.[1]);

  const classComponentsMatch = matchFirst(
    responseText,
    REGEX_PATTERNS.classComponents
  );
  const classComponents = safeParseInt(classComponentsMatch?.[1]);

  const functionalComponentsMatch = matchFirst(
    responseText,
    REGEX_PATTERNS.functionalComponents
  );
  const functionalComponents = safeParseInt(functionalComponentsMatch?.[1]);

  const timelineMatch = matchFirst(
    responseText,
    REGEX_PATTERNS.estimatedTimeline
  );
  const estimatedWeeks = safeParseInt(timelineMatch?.[1]);

  const riskLevelMatch = matchFirst(responseText, REGEX_PATTERNS.riskLevel);
  const riskLevel = riskLevelMatch?.[1] || DEFAULT_VALUES.RISK_LEVEL;

  const complexityMatch = matchFirst(responseText, REGEX_PATTERNS.complexity);
  const complexityText = complexityMatch?.[1] || "";
  const complexity = calculateComplexity(
    responseText,
    complexityText.toLowerCase(),
    totalComponents,
    classComponents
  );

  return {
    totalComponents,
    classComponents,
    functionalComponents,
    estimatedWeeks,
    riskLevel,
    complexity,
    antiPatterns: extractAntiPatterns(responseText),
    recommendedStrategies: extractRecommendedStrategies(responseText),
    phases: extractDetailedPhases(responseText),
  };
}

function calculateComplexity(
  responseText,
  complexityLevel,
  totalComponents,
  classComponents
) {
  const complexity = { ...DEFAULT_VALUES.COMPLEXITY };

  const simpleMatch = responseText.match(
    REGEX_PATTERNS.complexityBreakdown.simple
  );
  const mediumMatch = responseText.match(
    REGEX_PATTERNS.complexityBreakdown.medium
  );
  const complexMatch = responseText.match(
    REGEX_PATTERNS.complexityBreakdown.complex
  );

  if (simpleMatch && mediumMatch && complexMatch) {
    complexity.simple = safeParseInt(simpleMatch?.[1]);
    complexity.medium = safeParseInt(mediumMatch?.[1]);
    complexity.complex = safeParseInt(complexMatch?.[1]);
    return complexity;
  }

  const remaining = totalComponents - classComponents;

  if (
    COMPLEXITY_LEVELS.SIMPLE.some((level) => complexityLevel.includes(level))
  ) {
    complexity.simple = remaining;
  } else if (
    COMPLEXITY_LEVELS.MEDIUM.some((level) => complexityLevel.includes(level))
  ) {
    complexity.medium = remaining;
  } else if (
    COMPLEXITY_LEVELS.COMPLEX.some((level) => complexityLevel.includes(level))
  ) {
    complexity.complex = remaining;
  } else if (complexityLevel === "medium" || complexityLevel === "complex") {
    const half = Math.floor(remaining / 2);
    complexity.medium = half;
    complexity.complex = remaining - half;
  }

  if (
    complexity.simple === 0 &&
    complexity.medium === 0 &&
    complexity.complex === 0 &&
    totalComponents > 0 &&
    classComponents > 0
  ) {
    complexity.medium = remaining;
  }

  return complexity;
}

function extractAntiPatterns(responseText) {
  const antiPatternsSection = responseText.match(
    REGEX_PATTERNS.antiPatternsSection
  );
  if (!antiPatternsSection) return [];

  const items = extractListItems(antiPatternsSection[1]);
  return items.map((item) => {
    const parts = item.split(/[:\-]/);
    const name = (parts[0]?.trim() || item.substring(0, 50)).replace(
      /\*\*/g,
      ""
    );
    const description = (
      parts.length > 1 ? parts.slice(1).join(":").trim() : item
    ).replace(/\*\*/g, "");

    return {
      name,
      description,
      severity: determineSeverity(item),
      impact: determineImpact(item),
    };
  });
}

function extractRecommendedStrategies(responseText) {
  const strategiesSection = responseText.match(
    REGEX_PATTERNS.recommendedStrategiesSection
  );
  if (!strategiesSection) return [];

  const items = extractListItems(strategiesSection[1]);
  return items.map((item, index) => {
    const parts = item.split(/[:\-]/);
    const title = (parts[0]?.trim() || `Strategy ${index + 1}`).replace(
      /\*\*/g,
      ""
    );
    const description = (
      parts.length > 1 ? parts.slice(1).join(":").trim() : item
    ).replace(/\*\*/g, "");

    return {
      title,
      description,
      priority: determinePriority(item),
      category: categorizeStrategy(item),
    };
  });
}

function extractDetailedPhases(responseText) {
  const matches = [...responseText.matchAll(REGEX_PATTERNS.phase)];
  if (matches.length === 0) return [];

  return matches.map((currentMatch, i) => {
    const phaseNumber = parseInt(currentMatch[1]);
    const phaseTitle = currentMatch[2].trim();
    const startIndex = currentMatch.index + currentMatch[0].length;
    const endIndex =
      i < matches.length - 1 ? matches[i + 1].index : responseText.length;
    const phaseContent = responseText.substring(startIndex, endIndex).trim();

    const descMatch = phaseContent.match(REGEX_PATTERNS.phaseDescription);
    const description = descMatch?.[1]?.trim() || "";

    const durationMatch = phaseContent.match(REGEX_PATTERNS.phaseDuration);
    const estimatedTime =
      durationMatch?.[1]?.trim() || DEFAULT_VALUES.ESTIMATED_TIME;

    return {
      id: phaseNumber,
      title: phaseTitle,
      description,
      estimatedTime,
      progress: 0,
      insights: extractAllInsights(phaseContent),
    };
  });
}

function extractAllInsights(phaseContent) {
  const sections = [
    { regex: REGEX_PATTERNS.tasksSection, ...PHASE_SECTIONS[0] },
    { regex: REGEX_PATTERNS.capabilitiesSection, ...PHASE_SECTIONS[1] },
    { regex: REGEX_PATTERNS.toolsSection, ...PHASE_SECTIONS[2] },
    { regex: REGEX_PATTERNS.keyInsightsSection, ...PHASE_SECTIONS[3] },
  ];

  const insights = [];

  sections.forEach(({ regex, category, priority }) => {
    const sectionMatch = phaseContent.match(regex);
    if (!sectionMatch) return;

    const items = extractListItems(sectionMatch[1]);
    items.forEach((item) => {
      const title = item.split(/[:\.]/)[0].trim().replace(/\*\*/g, "");
      insights.push({
        title:
          title.length > DEFAULT_VALUES.MAX_TITLE_LENGTH
            ? title.substring(0, DEFAULT_VALUES.MAX_TITLE_LENGTH) + "..."
            : title,
        description: item,
        priority: determinePriority(item) || priority,
        actionRequired: priority === "high",
        category,
      });
    });
  });

  return insights;
}

function extractListItems(text) {
  const items = [];
  const lines = text.split("\n");
  let currentItem = "";

  for (const line of lines) {
    const trimmed = line.trim();
    const isListItem = REGEX_PATTERNS.listItem.some((pattern) =>
      pattern.test(trimmed)
    );

    if (isListItem) {
      if (currentItem) items.push(currentItem.trim());
      currentItem = REGEX_PATTERNS.listItem.reduce(
        (acc, pattern) => acc.replace(pattern, ""),
        trimmed
      );
    } else if (trimmed) {
      currentItem = currentItem ? `${currentItem} ${trimmed}` : trimmed;
    }
  }

  if (currentItem) items.push(currentItem.trim());

  return items
    .map((item) => item.replace(/\*\*/g, "").trim())
    .filter((item) => item.length > DEFAULT_VALUES.MIN_ITEM_LENGTH);
}

function determinePriority(text) {
  const lowerText = text.toLowerCase();

  for (const keyword of PRIORITY_KEYWORDS.high) {
    if (lowerText.includes(keyword)) return "high";
  }

  for (const keyword of PRIORITY_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) return "medium";
  }

  return "low";
}

function categorizeStrategy(text) {
  const lowerText = text.toLowerCase();

  if (
    STRATEGY_CATEGORIES.INCREMENTAL.some((keyword) =>
      lowerText.includes(keyword)
    )
  ) {
    return "Incremental";
  }

  if (
    STRATEGY_CATEGORIES.BIG_BANG.some((keyword) => lowerText.includes(keyword))
  ) {
    return "Big Bang";
  }

  if (
    STRATEGY_CATEGORIES.PARALLEL.some((keyword) => lowerText.includes(keyword))
  ) {
    return "Parallel";
  }

  if (
    STRATEGY_CATEGORIES.COMPONENT_BASED.some((keyword) =>
      lowerText.includes(keyword)
    )
  ) {
    return "Component-based";
  }

  return "General";
}

function determineSeverity(text) {
  const lowerText = text.toLowerCase();

  for (const [level, keywords] of Object.entries(SEVERITY_KEYWORDS)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return level;
    }
  }

  return "low";
}

function determineImpact(text) {
  const lowerText = text.toLowerCase();

  if (lowerText.includes(IMPACT_TYPES.PERFORMANCE)) {
    return "Performance";
  }

  if (lowerText.includes(IMPACT_TYPES.SECURITY)) {
    return "Security";
  }

  if (
    Array.isArray(IMPACT_TYPES.MAINTAINABILITY)
      ? IMPACT_TYPES.MAINTAINABILITY.some((keyword) =>
        lowerText.includes(keyword)
      )
      : lowerText.includes(IMPACT_TYPES.MAINTAINABILITY)
  ) {
    return "Maintainability";
  }

  if (lowerText.includes(IMPACT_TYPES.SCALABILITY)) {
    return "Scalability";
  }

  if (lowerText.includes(IMPACT_TYPES.ACCESSIBILITY)) {
    return "Accessibility";
  }

  return "Code Quality";
}



// shared helper logic (TypeScript)
export function getToastPayloadFromAI(resultText: string) {
  const normalized = resultText?.toLowerCase() ?? '';

  // Strategy 1: explicit markers or keys
  const looksJson = normalized.trim().startsWith('{');
  if (looksJson) {
    try {
      const parsed = JSON.parse(resultText);
      // If your AI returns a conventional field:
      if (parsed.status === 'success' || parsed.ok === true) {
        return { type: 'success', message: 'Analysis report is ready!' };
      }
      if (parsed.status === 'error' || parsed.error) {
        return { type: 'error', message: parsed.error?.message ?? 'Analysis failed. Please try again.' };
      }
    } catch {
      // fall through to heuristic checks
    }
  }

  // Strategy 2: heuristics on text
  const isError =
    normalized.includes('error') ||
    normalized.includes('failed') ||
    normalized.includes('exception') ||
    normalized.includes('timeout') ||
    normalized.includes('bad request') ||
    normalized.includes('invalid');

  if (isError) {
    return { type: 'error', message: 'Analysis failed. Please check inputs and try again.' };
  }

  return { type: 'success', message: 'Analysis report is ready!' };
}
