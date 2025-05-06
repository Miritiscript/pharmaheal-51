
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
    // Import the relevance check prompt from config
    const { RELEVANCE_CHECK_PROMPT } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const relevanceCheckPrompt = RELEVANCE_CHECK_PROMPT.replace("{query}", query);
    
    // Log the prompt for debugging
    console.log("Sending relevance check prompt:", relevanceCheckPrompt);
    
    // Call the Gemini API with the relevance check prompt
    const responseText = await callGeminiAPI(relevanceCheckPrompt);
    console.log("Raw relevance check response:", responseText);
    
    // Parse the JSON response
    let json: { isRelevant: boolean; reason: string };
    try {
      json = JSON.parse(responseText.trim());
      console.log("Parsed JSON response:", json);
      
      // Return the isRelevant boolean directly
      return json.isRelevant;
    } catch (jsonError) {
      console.warn("Failed to parse relevance check response as JSON:", jsonError);
      
      // Fall back to the local validator if JSON parsing fails
      const { isValidMedicalQuery } = await import('./queryValidator');
      const isRelevant = isValidMedicalQuery(query);
      
      console.log("Fallback to local validator result:", isRelevant);
      return isRelevant;
    }
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    // Default to accepting the query if there's an error with the API
    return true;
  }
};
