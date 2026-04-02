import { generateAIResponse } from "./aiService";

interface CodeFile {
  name: string;
  content?: string;
  text(): Promise<string>;
}

export async function reactAnalyzeCode(files: CodeFile[]) {
  try {
    // Separate package.json from code files
    const packageJsonFile = files.find((f) => (f.name || f.path?.split('/').pop()) === "package.json");
    const codeFiles = files.filter((f) => (f.name || f.path?.split('/').pop()) !== "package.json");

    let packageJsonContent = null;
    if (packageJsonFile) {
      packageJsonContent = packageJsonFile.content || await packageJsonFile.text?.();
    }

    const fileContents = await Promise.all(
      codeFiles.map(async (file) => {
        if (file?.content) return file.content;
        if (file?.text) return await file.text();
        return "";
      })
    );

    const getFileName = (file: any) => file.name || file.path?.split('/').pop() || file.path || 'unknown';
    const prompt = `
    You are an expert React migration assistant. Analyze the following React code files ${packageJsonContent ? "and package.json dependencies" : ""
      } and provide a comprehensive migration analysis with detailed phases.

    ${packageJsonContent
        ? `
    **IMPORTANT: PACKAGE.JSON ANALYSIS REQUIRED**

    Analyze the dependencies below and provide detailed recommendations:

    Package.json content:
    \`\`\`json
    ${packageJsonContent}
    \`\`\`

    You MUST analyze and provide:
    1. React ecosystem packages (react, react-dom, react-router-dom, etc.)
    2. State management libraries (redux, mobx, zustand, etc.)
    3. UI component libraries (material-ui, antd, chakra-ui, etc.)
    4. Build tools (webpack, vite, create-react-app, etc.)
    5. Testing libraries (jest, enzyme, react-testing-library, etc.)
    6. Utility libraries (lodash, moment, date-fns, etc.)
    7. Type checking (prop-types, typescript, etc.)

    For EACH dependency that needs attention, provide in this EXACT format:
    [package-name] (current: [version]) → (recommended: [version]): [detailed reason]
    OR
    [package-name] (current: [version]) → Replace with [new-package] ([version]): [detailed reason]

    `
        : ""
      }

    Required Format (provide actual numbers based on code analysis):
    **Total Components:** [number]
    **Class Components:** [number]
    **Functional Components:** [number]
    **Complexity:** Simple: [number], Medium: [number], Complex: [number]
    **Estimated Migration Timeline:** [number] weeks
    **Risk Level:** [Low/Medium/High]

    IMPORTANT: You MUST use EXACTLY this format with the bold markdown (**) for the above fields. These are parsed programmatically.

    ${packageJsonContent
        ? `
    **Dependency Analysis:**
    [List EACH dependency that needs update or replacement in the exact format specified above]

    `
        : ""
      }

    **Detected Anti-Patterns:**
    [List all React anti-patterns found in the actual code with specific details]

    **Recommended Migration Strategy:**
    [Provide specific migration strategies based on this codebase's characteristics]


    **Migration Phases:**

    Phase 1: Assessment & Planning
    Description: Comprehensive analysis of the existing codebase to understand architecture, dependencies, and complexity or any small content Ensure don't return blank or empty.
    Duration: [specify weeks based on codebase size]
    Capabilities:
    - Intelligent pattern recognition for identifying React patterns and anti-patterns
    - Risk assessment scoring based on component complexity and dependencies
    - Automated anti-pattern detection
    - Migration complexity prediction using AI models
    - Dependency compatibility analysis

    Specific tasks based on the actual codebase:
    [List 4-6 SPECIFIC tasks based on the actual code analyzed, not generic tasks]

    AI capabilities that will help:
    [List 3-5 specific AI capabilities relevant to this codebase]

    Recommended tools:
    [List 3-5 specific tools needed for this particular project]

    Key insights and recommendations:
    [List 3-5 key insights specific to this codebase's challenges and opportunities]

    ${packageJsonContent
        ? `
    Phase 2: Dependency Modernization
    Description: Update package.json and resolve all dependency compatibility issues before code migration or any small content Ensure don't return blank or empty.
    Duration: [specify weeks based on number of dependencies to update]
    Capabilities:
    - Automated dependency update recommendations
    - Breaking change detection and documentation
    - Peer dependency conflict resolution
    - Version compatibility validation
    - Bundle size impact analysis

    Specific tasks based on the actual codebase:
    [List specific dependency update tasks based on actual package.json analysis - be specific about which packages]

    AI capabilities that will help:
    [List AI capabilities for managing these specific dependencies]

    Recommended tools:
    [List dependency management tools needed for these specific updates]

    Key insights and recommendations:
    [List key insights about the dependency updates required for this project]

    Phase 3: Architecture Design
    `
        : `
    Phase 2: Architecture Design
    `
      }
    Description: Design modern architecture and create migration strategy based on analysis findings or any small content Ensure don't return blank or empty.
    Duration: [specify weeks]
    Capabilities:
    - Component architecture analysis and recommendations
    - Dependency mapping and visualization
    - Scalability analysis
    - Performance optimization strategies

    Specific tasks based on the actual codebase:
    [List 4-6 SPECIFIC architectural tasks based on the actual code structure]

    AI capabilities that will help:
    [List 3-5 specific AI capabilities]

    Recommended tools:
    [List 3-5 specific tools]

    Key insights and recommendations:
    [List 3-5 actionable insights for this codebase]

    ${packageJsonContent ? "Phase 4" : "Phase 3"}: Development & Migration
    Description: Execute the migration with automated tools and manual refactoring where needed or any small content Ensure don't return blank or empty
    Duration: [specify weeks based on complexity]
    Capabilities:
    - Automated code transformation
    - Hook conversion assistance
    - State management refactoring
    - Type safety enhancement
    - API migration for updated libraries

    Specific tasks based on the actual codebase:
    [List 5-8 SPECIFIC migration tasks based on actual components found]

    AI capabilities that will help:
    [List 4-6 AI capabilities needed for this migration]

    Recommended tools:
    [List 4-6 tools specific to this migration]

    Key insights and recommendations:
    [List 4-6 insights about migration challenges in this codebase]

    ${packageJsonContent ? "Phase 5" : "Phase 4"}: Testing & Quality Assurance
    Description: Comprehensive testing to ensure migrated code maintains functionality and improves quality or any small content Ensure don't return blank or empty. 
    Duration: [specify weeks]
    Capabilities:
    - Automated test generation
    - Coverage analysis
    - Regression detection
    - Performance benchmarking
    - Integration testing

    Specific tasks based on the actual codebase:
    [List 4-6 SPECIFIC testing tasks needed for this project]

    AI capabilities that will help:
    [List 3-5 AI capabilities for testing]

    Recommended tools:
    [List 3-5 testing tools needed]

    Key insights and recommendations:
    [List 3-5 testing insights for this project]

    ${packageJsonContent ? "Phase 6" : "Phase 5"}: Deployment & Optimization
    Description: Deploy to production with monitoring and continuous improvement or any small content Ensure don't return blank or empty.
    Duration: 1 week + ongoing
    Capabilities:
    - Security vulnerability scanning
    - Performance monitoring
    - Deployment validation
    - Rollback strategies
    - Continuous optimization

    Specific tasks based on the actual codebase:
    [List 4-5 SPECIFIC deployment tasks for this project]

    AI capabilities that will help:
    [List 3-4 AI capabilities for deployment]

    Recommended tools:
    [List 3-4 deployment tools]

    Key insights and recommendations:
    [List 3-4 deployment insights]

    IMPORTANT: 
    - must provide some data or dummy data in Phase description don't return empty brackets
    - Analyze the ACTUAL code provided, not hypothetical scenarios
    - Provide SPECIFIC numbers and details from the code
    - Base all recommendations on what you actually see in the files
    - For each phase, provide tasks that directly relate to the code analyzed
    - must provide some data or dummy data in Phase description don't return empty brackets

    Code Files (${codeFiles.length} files):
    ${fileContents
        .map(
          (content, idx) => `
    --- File ${idx + 1}: ${getFileName(codeFiles[idx])} ---
    ${content}
    `
        )
        .join("\n\n")}
    `;

    const result = await generateAIResponse(prompt);
    console.log('🔍 Raw AI Analysis Response:', result);
    return result;
  } catch (error) {
    console.log("error: ", error);
    throw error;
  }
}