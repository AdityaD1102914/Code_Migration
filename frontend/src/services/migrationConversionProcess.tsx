import { generateAIResponse } from "./aiService";


export async function aiConversionFunction(files) {

  const conversions = await Promise.all(
    files.map(async (file) => {
      const rawContent = file?.content || await file?.text?.() || "";
      const content = typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent, null, 2);
      const fileName = file?.path;

      if (!content.trim()) {
        return { path: fileName, content: "" };
      }

      const prompt = `Modernize the following code. Rules:
- Update deprecated syntax and patterns to their modern equivalents
- Convert class components to functional components with hooks if React
- Update old API usage to current API (e.g. old lifecycle methods, deprecated imports)
- Keep the same logic, same structure, same functionality
- Do NOT add TypeScript, new libraries, CSS frameworks, comments, or extra features
- Do NOT expand the code — output should be similar in length to the input

Code:
\`\`\`
${content}
\`\`\`

Return ONLY the modernized code. No explanations.`;

        const result = await generateAIResponse(prompt);

      // Remove markdown code blocks if present
      const cleanCode = result
      .replace(/^```[\w]*\n/, "")
      .replace(/\n```$/, "")
      .trim();
      
      return {
        path: fileName,
        content: cleanCode,
      };
    })
  );

  return conversions;
}
