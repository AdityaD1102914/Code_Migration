import { generateAIResponse } from "./aiService";

export async function angularAnalyzeCode(files: any) {
  try {
    const fileContents = await Promise.all(
      files.map(async (file: any) => {
        if (file?.content) return file.content;
        if (file?.text) return await file.text();
        return "";
      })
    );

    const prompt = `
You are an advanced migration assistant specialized in converting AngularJS codebases into Angular 20 projects with TypeScript. I will upload AngularJS project files. Analyze the content of each uploaded file to determine its: type,
role, comprehensive migration analysis with detailed phases in the AngularJS app.
Return the result strictly in JSON format as shown below:

{
  "complexityScore": [number],
  "Complexity": {
    "Simple": [number],
    "Medium": [number],
    "Complex": [number]
  },
  "totalLinesOfCode": [number],
  "modules": [number],
  "modulesList": [],
  "controllers": [number],
  "controllersList": [],
  "services": [number],
  "servicesList": [],
  "directives": [number],
  "directivesList": [],
  "RouteConfiguration": [number],
  "RouteConfigurationList": [],
  "filters": [number],
  "filtersList": [],
  "HTMLTemplate": [number],
  "HTMLTemplateList": [],
  "antiPatterns": [number],
  "antiPatternsList": [],
  "dependencies": [number],
  "dependenciesList": [],
  "migrationOrder": [number],
  "recommendedStrategy": [number],
  "EstimatedMigrationTimeline": [number],
  "RiskLevel": "[Low/Medium/High]",
  
  "MigrationPhases": {
    "Phase1": {
      "PhaseName": "Assessment & Planning",
      "Description": "Comprehensive analysis of the existing codebase to understand architecture, dependencies, and complexity.",
      "Duration": "1-2 weeks",
      "SpecificTasks": [],
      "AICapabilities": [],
      "RecommendedTools": [],
      "KeyInsightsAndRecommendations": []
    },
    "Phase2": {
      "PhaseName": "Architecture Design",
      "Description": "Design modern architecture and create migration strategy based on analysis findings.",
      "Duration": "2-3 weeks",
      "SpecificTasks": [],
      "AICapabilities": [],
      "RecommendedTools": [],
      "KeyInsightsAndRecommendations": []
    },
    "Phase3": {
      "PhaseName": "Development & Migration",
      "Description": "Execute the migration with automated tools and manual refactoring where needed.",
      "Duration": "3-6 weeks",
      "SpecificTasks": [],
      "AICapabilities": [],
      "RecommendedTools": [],
      "KeyInsightsAndRecommendations": []
    },
    "Phase4": {
      "PhaseName": "Testing & Quality Assurance",
      "Description": "Comprehensive testing to ensure migrated code maintains functionality and improves quality.",
      "Duration": "1-2 weeks",
      "SpecificTasks": [],
      "AICapabilities": [],
      "RecommendedTools": [],
      "KeyInsightsAndRecommendations": []
    },
    "Phase5": {
      "PhaseName": "Deployment & Optimization",
      "Description": "Deploy to production with monitoring and continuous improvement.",
      "Duration": "1 week + ongoing",
      "SpecificTasks": [],
      "AICapabilities": [],
      "RecommendedTools": [],
      "KeyInsightsAndRecommendations": []
    }
  }
}

Please customize the values according to the uploaded AngularJS codebase, including:

patterns,
dependencies,
complexity analysis,
migration order,
recommended strategy,
estimated timeline,
risk level.
For each migration phase, provide:
Specific tasks uniquely derived from the analysis of the provided codebase.
AI capabilities that will assist the phase.
Recommended tools for that phase.
Key insights and recommendations specific to the actual project code.
The output must be valid JSON with all fields populated based on the real analysis of the code, without any textual explanation outside the JSON block.

Code:
${fileContents.join("\n\n")}
`;

    const result = await generateAIResponse(prompt);
    return result;
  } catch (error) {
    console.log("error: ", error);
    throw error;
  }
}
