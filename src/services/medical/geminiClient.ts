import { GEMINI_CONFIG } from './geminiConfig';

/**
 * Calls Gemini API with enhanced retry mechanism for improved reliability
 */
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
  
  // Implement retry logic
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= GEMINI_CONFIG.MAX_RETRIES) {
    try {
      console.log(`API attempt ${attempts + 1}...`);
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
        const errorData = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` }}));
        console.error("Gemini API HTTP error:", errorData);
        throw new Error(errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      
      // Log the raw response for debugging
      console.log("Gemini API raw response success:", JSON.stringify(data).substring(0, 200) + "...");
      
      // Extract and return the text
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }
      
      console.log("Successful response length:", responseText.length);
      return responseText;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini API attempt ${attempts + 1} failed:`, error);
      
      // If we've reached max retries, throw the error
      if (attempts >= GEMINI_CONFIG.MAX_RETRIES) {
        console.error("Max retries reached, giving up");
        throw error;
      }
      
      // Otherwise wait and retry with exponential backoff
      const delayTime = GEMINI_CONFIG.RETRY_DELAY * Math.pow(1.5, attempts);
      console.log(`Retrying in ${delayTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
      attempts++;
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript doesn't know that
  throw lastError || new Error("Failed to call Gemini API after retries");
};

// Generate content using main medical prompt with improved error handling
export const generateGeminiContent = async (query: string): Promise<{ text: string }> => {
  try {
    // Import the medical prompt template from config
    const { MEDICAL_PROMPT_TEMPLATE } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const medicalPrompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", query);
    
    console.log(`Sending medical query to Gemini: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Try to get a response with retries built in
    const response = await callGeminiAPI(medicalPrompt);
    return { text: response };
  } catch (error) {
    console.error("Failed to generate Gemini content:", error);
    
    // Create a more user-friendly fallback response for any error
    if (error instanceof Error) {
      // If the error is likely due to API issues, provide a helpful fallback response
      return { 
        text: `I'm sorry, I couldn't retrieve information about your query. The medical AI service is currently experiencing issues.\n\n` +
              `1. DISEASE DESCRIPTION\n` +
              `• The system is currently unable to provide details about this condition\n` +
              `• Please try again later or try rephrasing your query\n` +
              `• Error details: ${error.message}\n\n` +
              `Medical Disclaimer: This is an automated fallback message. Please consult a healthcare professional for medical advice.`
      };
    }
    
    throw error;
  }
};

// Check if a query is medically relevant with more permissive parsing
export const checkMedicalRelevance = async (query: string): Promise<boolean> => {
  try {
    // Import the relevance check prompt from config
    const { RELEVANCE_CHECK_PROMPT } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const relevanceCheckPrompt = RELEVANCE_CHECK_PROMPT.replace("{query}", query);
    
    // Call the Gemini API with the relevance check prompt
    console.log(`Checking relevance for: "${query}"`);
    const response = await callGeminiAPI(relevanceCheckPrompt);
    
    // More resilient JSON parsing with multiple fallback strategies
    try {
      // First, try to find and parse any JSON-like structure in the response
      const jsonMatch = response.match(/(\{.*?\})/s);
      if (jsonMatch && jsonMatch[0]) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Check if the isRelevant field is defined and is a boolean
        if (parsed && typeof parsed.isRelevant === 'boolean') {
          console.log("Successfully parsed relevance check result:", parsed);
          return parsed.isRelevant;
        }
      }
      
      // Next try: Clean the response of any markdown code block formatting
      const cleanedResponse = response.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedResponse);
      
      console.log("Parsed relevance check result (after cleaning):", parsed);
      
      // Check if the isRelevant field is defined and is a boolean
      if (parsed && typeof parsed.isRelevant === 'boolean') {
        return parsed.isRelevant;
      }
    } catch (jsonError) {
      console.warn("Failed to parse relevance check response as JSON:", jsonError);
    }
    
    // Fallback to keyword detection - much more permissive approach
    console.log("Falling back to keyword-based relevance detection");
    
    // For certain medical keywords, always consider relevant
    const definitelyMedicalKeywords = [
      'disease', 'condition', 'syndrome', 'leukemia', 'cancer', 'diabetes', 
      'hypertension', 'asthma', 'arthritis', 'medication', 'treatment'
    ];
    
    // Check for obvious medical terms first
    for (const keyword of definitelyMedicalKeywords) {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        console.log(`Query contains medical keyword '${keyword}', considering relevant`);
        return true;
      }
    }
    
    // Fallback: Look for positive keywords in the response text
    const positiveIndicators = ['"isRelevant": true', 'yes', 'relevant', 'medical', 'health', 'medication', 'treatment', 'true'];
    const isRelevant = positiveIndicators.some(indicator => 
      response.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // If we found positive indicators, consider it relevant
    if (isRelevant) {
      console.log("Text-based relevance check found positive indicators");
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
