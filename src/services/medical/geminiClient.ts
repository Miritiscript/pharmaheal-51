
import { GEMINI_CONFIG } from './geminiConfig';

export const callGeminiAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
  
  try {
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

    // Log the response status for debugging
    console.log("Gemini API response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(errorData.error?.message || `Failed with status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Gemini API raw response:", JSON.stringify(data).substring(0, 200) + "...");
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error("Unexpected Gemini API response structure:", data);
      throw new Error("Unexpected response structure from Gemini API");
    }
    
    return data.candidates[0].content.parts[0].text || "";
  } catch (error) {
    console.error("Error in callGeminiAPI:", error);
    throw error;
  }
};

// Generate content using main medical prompt
export const generateGeminiContent = async (query: string): Promise<{ text: string }> => {
  try {
    // Import the medical prompt template from config
    const { MEDICAL_PROMPT_TEMPLATE } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const fullPrompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", query);
    
    console.log("Sending full medical prompt:", fullPrompt.substring(0, 100) + "...");
    
    const response = await callGeminiAPI(fullPrompt);
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
    console.log("Sending relevance check prompt:", relevanceCheckPrompt.substring(0, 100) + "...");
    
    // Call the Gemini API with the relevance check prompt
    const responseText = await callGeminiAPI(relevanceCheckPrompt);
    console.log("Raw relevance check response:", responseText);
    
    // Parse the JSON response
    let json: { isRelevant: boolean; reason: string };
    try {
      // Remove any extra text before or after the JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : responseText.trim();
      
      json = JSON.parse(jsonText);
      console.log("Parsed JSON response:", json);
      
      // Always return true for suggested prompts or known medical terms
      if (isCommonMedicalQuery(query)) {
        console.log("Query accepted as common medical term:", query);
        return true;
      }
      
      // Return the isRelevant boolean directly
      return json.isRelevant;
    } catch (jsonError) {
      console.warn("Failed to parse relevance check response as JSON:", jsonError, "Response was:", responseText);
      
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

// Helper function to check if a query contains common medical terms or is a suggested prompt
function isCommonMedicalQuery(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  // List of common medical terms that should always be accepted
  const commonTerms = [
    "covid", "diabetes", "high blood pressure", "migraine", "headache",
    "heart", "cancer", "pain", "treatment", "symptoms", "side effects",
    "drug", "medicine", "prescription", "dose", "dosage", "ibuprofen",
    "advil", "aspirin", "tylenol", "acetaminophen", "antibiotics",
    "vaccine", "vaccination", "warfarin", "blood thinner"
  ];
  
  // Check if query contains any common medical term
  for (const term of commonTerms) {
    if (lowerQuery.includes(term)) {
      return true;
    }
  }
  
  // Check if this is one of our suggested prompts
  const suggestedPrompts = [
    "what are the side effects of ibuprofen",
    "best treatments for migraine",
    "drug interactions with warfarin",
    "herbal remedies for anxiety",
    "foods to avoid with high blood pressure"
  ];
  
  // Normalize query for comparison
  const normalizedQuery = lowerQuery.replace(/[?.,]/g, '').trim();
  
  // Check if query matches any suggested prompt
  for (const prompt of suggestedPrompts) {
    if (normalizedQuery.includes(prompt.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}
