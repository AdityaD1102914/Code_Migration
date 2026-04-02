import { generateAIResponse } from "./aiService";

export async function refineConvertedCode(file: any, userFeedback: string) {

  const prompt = `
You are an expert React developer tasked with refining a converted React component based on user feedback.

**Context:**
A class component was converted to a functional component with hooks. The user has reviewed the conversion and provided specific feedback for improvements.

**Original Class Component:**
\`\`\`javascript
${file?.originalContent}
\`\`\`

**Current Converted Code:**
\`\`\`javascript
${file?.content}
\`\`\`

**User Feedback:**
${userFeedback}

**Your Task:**
Refine the converted code by addressing the user's feedback while maintaining all the improvements from the initial conversion. 

**Requirements:**
1. Carefully address ALL points mentioned in the user feedback
2. Maintain modern React best practices (hooks, functional components)
3. Preserve all existing functionality from the original component
4. Keep the code clean, readable, and well-commented
5. Use appropriate hooks (useState, useEffect, useCallback, useMemo, useRef, etc.)
6. Follow proper error handling patterns if requested
7. Optimize performance where suggested
8. Add TypeScript types if the user requests it
9. Ensure accessibility improvements if mentioned
10. Keep consistent code style and formatting

**Important Guidelines:**
- If the feedback mentions performance optimization, use useMemo and useCallback appropriately
- If the feedback mentions error handling, add proper try-catch blocks and error states
- If the feedback mentions accessibility, add proper ARIA labels and keyboard navigation
- If the feedback mentions testing, add comments explaining testable units
- If the feedback is unclear, make the best interpretation that improves code quality

Provide ONLY the refined converted code without any explanations or markdown formatting. Start directly with the imports.
`;

  try {
    const refinedCode = await generateAIResponse(prompt);

    const cleanCode = refinedCode
      .replace(/^```[\w]*\n/, "")
      .replace(/\n```$/, "")
      .trim();

    return cleanCode;
  } catch (error: any) {
    console.error("Error refining code with AI:", error);
    throw new Error(`Failed to refine code: ${error.message}`);
  }
}

export async function validateConversion(file: any) {

  const prompt = `
Analyze whether this React component conversion maintains all functionality from the original.

**Original Code:**
\`\`\`javascript
${file.originalContent}
\`\`\`

**Converted Code:**
\`\`\`javascript
${file.content}
\`\`\`

Check for:
1. All state variables are properly converted
2. All lifecycle methods are replaced with appropriate hooks
3. All event handlers are preserved
4. All props are maintained
5. No functionality is lost
6. Side effects are properly handled

Respond with a JSON object:
{
  "isValid": true/false,
  "issues": ["list of any functionality issues found"],
  "warnings": ["list of potential concerns"],
  "score": 0-100 (conversion quality score)
}

Provide ONLY the JSON object, no additional text.
`;

  try {
    const responseText = await generateAIResponse(prompt);

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      isValid: false,
      issues: ["Could not validate conversion"],
      warnings: [],
      score: 0,
    };
  } catch (error: any) {
    console.error("Error validating conversion:", error);
    return {
      isValid: false,
      issues: [error.message],
      warnings: [],
      score: 0,
    };
  }
}

