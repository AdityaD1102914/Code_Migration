export function parseAngularAIResult(responseText) {
  let rawString = responseText.slice(7, -3);

  const data = JSON.parse(rawString);
  const phaseDetails = getPhaseData(data.MigrationPhases);
  data.MigrationPhases = phaseDetails;
  return data;
}

function getPhaseData(MigrationPhases) {
  const phases = Object.entries(MigrationPhases).map(
    ([phaseKey, phaseValue]: any) => ({
      id: phaseKey, // e.g. "Phase1"
      title: phaseValue.PhaseName,
      description: phaseValue.Description,
      estimatedTime: phaseValue.Duration,
      progress: 0, // default value as you specified
      // Extract ALL insights sections from AI response
      insights: extractAllInsights(phaseValue),
    })
  );
  return phases;
}

function extractAllInsights(phaseContent) {
  const insights = [];

  // 1. Extract "Specific tasks based on the actual codebase"
  const tasksSection = phaseContent.SpecificTasks;
  if (tasksSection) {
    tasksSection.forEach((task) => {
      // Determine priority based on keywords
      const priority = determinePriority(task);

      // Extract title (before colon or first sentence)
      let title = task;

      // If title is too long, take first few words
      if (title.length > 60) {
        title = task.substring(0, 60).trim() + "...";
      }

      insights.push({
        title: title,
        description: task,
        priority: priority,
        actionRequired: priority === "high",
        category: "task",
      });
    });
  }

  // 2. Extract "AI capabilities that will help"
  const capabilitiesSection = phaseContent.AICapabilities;
  if (capabilitiesSection) {
    capabilitiesSection.forEach((capability) => {
      insights.push({
        title:
          capability.substring(0, 50).trim() +
          (capability.length > 50 ? "..." : ""),
        description: capability,
        priority: "medium",
        actionRequired: false,
        category: "capability",
      });
    });
  }

  // 3. Extract "Recommended tools"
  const toolsSection = phaseContent.RecommendedTools;
  if (toolsSection) {
    toolsSection.forEach((tool) => {
      let title = tool;
      insights.push({
        title: title,
        description: tool,
        priority: "low",
        actionRequired: false,
        category: "tool",
      });
    });
  }

  // 4. Extract "Key insights and recommendations"
  const keyInsightsSection = phaseContent.KeyInsightsAndRecommendations;
  if (keyInsightsSection) {
    keyInsightsSection.forEach((insight) => {
      const priority = determinePriority(insight);

      // Get title (first sentence or before period)
      let title = insight;
      if (title.length > 60) {
        title = title.substring(0, 60).trim() + "...";
      }

      insights.push({
        title: title,
        description: insight,
        priority: priority,
        actionRequired: priority === "high",
        category: "insight",
      });
    });
  }

  return insights;
}

function determinePriority(text) {
  const lowerText = text.toLowerCase();

  // High priority keywords
  const highKeywords = [
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
  ];

  // Medium priority keywords
  const mediumKeywords = [
    "should",
    "important",
    "consider",
    "recommend",
    "improve",
  ];

  for (const keyword of highKeywords) {
    if (lowerText.includes(keyword)) {
      return "high";
    }
  }

  for (const keyword of mediumKeywords) {
    if (lowerText.includes(keyword)) {
      return "medium";
    }
  }

  return "low";
}
