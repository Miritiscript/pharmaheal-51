import { GEMINI_CONFIG } from './geminiConfig';

/**
 * Calls Gemini API with retry mechanism for improved reliability
 */
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
  
  // Implement retry logic
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= GEMINI_CONFIG.MAX_RETRIES) {
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

      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API HTTP error:", errorData);
        throw new Error(errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      
      // Log the raw response for debugging
      console.log("Gemini API raw response:", JSON.stringify(data).substring(0, 200) + "...");
      
      // Extract and return the text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }
      
      return responseText;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini API attempt ${attempts + 1} failed:`, error);
      
      // If we've reached max retries, throw the error
      if (attempts >= GEMINI_CONFIG.MAX_RETRIES) {
        throw error;
      }
      
      // Otherwise wait and retry
      await new Promise(resolve => setTimeout(resolve, GEMINI_CONFIG.RETRY_DELAY));
      attempts++;
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript doesn't know that
  throw lastError || new Error("Failed to call Gemini API after retries");
};

// Generate content using main medical prompt
export const generateGeminiContent = async (query: string): Promise<{ text: string }> => {
  try {
    // Import the medical prompt template from config
    const { MEDICAL_PROMPT_TEMPLATE } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const medicalPrompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", query);
    
    console.log(`Sending medical query to Gemini: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    const response = await callGeminiAPI(medicalPrompt);
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
    
    // Call the Gemini API with the relevance check prompt
    console.log(`Checking relevance for: "${query}"`);
    const response = await callGeminiAPI(relevanceCheckPrompt);
    console.log("Raw relevance check response:", response);
    
    // Try to parse the response as JSON
    try {
      // Clean the response - sometimes there's markdown code block formatting
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      console.log("Parsed relevance check result:", parsed);
      
      // Check if the isRelevant field is defined and is a boolean
      if (parsed && typeof parsed.isRelevant === 'boolean') {
        return parsed.isRelevant;
      }
    } catch (jsonError) {
      console.warn("Failed to parse relevance check response as JSON:", jsonError);
      // Fall through to text-based checking
    }
    
    // Fallback: Look for positive keywords in the response text
    const positiveIndicators = ['"isRelevant": true', 'yes', 'relevant', 'medical', 'health', 'medication', 'treatment'];
    const isRelevant = positiveIndicators.some(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // If we found positive indicators, consider it relevant
    if (isRelevant) {
      console.log("Text-based relevance check found positive indicators");
      return true;
    }
    
    // If query contains common medical terms, consider it relevant as a backup safety check
    const medicalKeywords = ['disease', 'condition', 'symptom', 'treatment', 'medication', 'drug', 'health', 'medical', 'cure', 'therapy'];
    const containsMedicalTerms = medicalKeywords.some(term => query.toLowerCase().includes(term));
    
    if (containsMedicalTerms) {
      console.log("Query contains medical keywords, considering relevant");
      return true;
    }
    
    console.log("Query determined to be non-medical");
    return false;
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    // Default to accepting the query if there's an error with the API
    return true;
  }
};
