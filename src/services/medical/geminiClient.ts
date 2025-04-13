
import { GEMINI_CONFIG } from './geminiConfig';

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  const response = await fetch(`${GEMINI_CONFIG.API_URL}?key=${GEMINI_CONFIG.API_KEY}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: GEMINI_CONFIG.DEFAULT_PARAMS,
    }),
  });

  if (!response.ok) {
    const data = await response.json();
    console.error("Gemini API error:", data);
    throw new Error(data.error?.message || "Failed to get response from Gemini API");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

// Add generateGeminiContent function
export const generateGeminiContent = async (query: string): Promise<{ text: string }> => {
  try {
    const response = await callGeminiAPI(query);
    return { text: response };
  } catch (error) {
    console.error("Failed to generate Gemini content:", error);
    throw error;
  }
};
