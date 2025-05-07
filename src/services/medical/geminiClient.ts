
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

// Generate content using main medical prompt
export const generateGeminiContent = async (query: string): Promise<{ text: string }> => {
  try {
    const response = await callGeminiAPI(query);
    return { text: response };
  } catch (error) {
    console.error("Failed to generate Gemini content:", error);
    throw error;
  }
};

// Check if a query is medically relevant
export const checkMedicalRelevance = async (query: string): Promise<boolean> => {
  try {
    const relevanceCheckPrompt = `
You are a medical relevance filter.

Determine if the following user query is related to any of the following categories:
- Human health
- Diseases
- Medications
- Side effects
- Drug indications or contraindications
- Natural or herbal remedies
- Nutrition and wellness

Respond only with:
"Yes" - if it's clearly related to the above topics.
"No" - if it's unrelated or not medical in nature.

Query: "${query}"
Your answer: `;

    const response = await callGeminiAPI(relevanceCheckPrompt);
    console.log("Medical relevance check response:", response);
    
    // Check if the response contains "Yes"
    return response.trim().toLowerCase().includes("yes");
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    // Default to accepting the query if there's an error
    return true;
  }
};
