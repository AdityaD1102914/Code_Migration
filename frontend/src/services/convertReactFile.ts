import { generateAIResponse } from "./aiService";

export async function convertToFunctional(files) {
  const conversions = await Promise.all(
    files.map(async (file) => {
      const content = await file.text();
      const fileName = file.name;

      const prompt = `Convert the following React code to modern React. Rules:
- Convert class components to functional components with hooks
- Replace componentDidMount/componentDidUpdate/componentWillUnmount with useEffect
- Replace this.state with useState
- Keep the same logic, same JSX structure, same props
- Do NOT add TypeScript, CSS frameworks, extra libraries, or comments
- Do NOT expand or add new features
- Output must be roughly the same length as the input

Code:
\`\`\`
${content}
\`\`\`

Return ONLY the converted code. No explanations.`;

      const result = await generateAIResponse(prompt);

      const cleanCode = result
        .replace(/^```[\w]*\n/, "")
        .replace(/\n```$/, "")
        .trim();

      return {
        name: fileName,
        content: cleanCode,
      };
    })
  );

  return conversions;
}
