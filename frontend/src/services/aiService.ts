import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

// Environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const apiUrl = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const apiModal = import.meta.env.VITE_AI_MODAL;
const isGemini = import.meta.env.VITE_IS_GEMINI === "true";

export async function generateAIResponse(prompt: string): Promise<string> {
  console.log('🔍 AI Service Debug:');
  console.log('- isGemini:', isGemini);
  console.log('- GEMINI_API_KEY exists:', !!GEMINI_API_KEY);
  console.log('- Prompt length:', prompt.length);
  
  try {
    if (isGemini) {
      console.log('📡 Using Gemini AI');
      if (!GEMINI_API_KEY) {
        console.error('❌ GEMINI_API_KEY is missing!');
        return "";
      }
      // Use Gemini AI
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      console.log('🤖 Sending request to Gemini...');
      const result = await model.generateContent(prompt);
      const response = result.response.text();
      console.log('✅ Gemini response length:', response.length);
      return response;
    } else {
      console.log('📡 Using OpenRouter AI');
      if (!apiKey) {
        console.error('❌ OpenRouter API_KEY is missing!');
        return "";
      }
      // Use OpenRoute AI
      const response = await axios.post(
        apiUrl,
        {
          model: apiModal,
          messages: [{ role: "user", content: prompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "",
            "X-Title": "JSP Analyzer",
          },
        }
      );

      // Extract the response content safely
      const content = response.data?.choices?.[0]?.message?.content || "";
      console.log('✅ OpenRouter response length:', content.length);
      return content;
    }
  } catch (error) {
    console.error("❌ Error generating AI response:", error);
    throw error;
  }
}
