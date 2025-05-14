
import { GROQ_CONFIG, GROQ_MEDICAL_PROMPT } from './groqConfig';
import { generateLocalFallbackResponse } from '../medical/localFallback';

/**
 * Calls the Groq API with enhanced retry mechanism and better logging
 */
export const callGroqAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Groq API with prompt:", prompt.substring(0, 100) + "...");
  
  // Check if we need to use local fallback - now with clear logging
  const useLocalFallback = !GROQ_CONFIG.API_KEY || 
                          GROQ_CONFIG.API_KEY.length < 10 || 
                          localStorage.getItem('use_local_groq_fallback') === 'true';
  
  if (useLocalFallback) {
    console.log("Using local fallback for Groq API because:", 
      !GROQ_CONFIG.API_KEY ? "No API key available" : 
      GROQ_CONFIG.API_KEY.length < 10 ? "API key appears invalid (too short)" : 
      "Local fallback setting is enabled");
    return await generateLocalFallbackResponse(prompt);
  }
  
  let attempts = 0;
  let lastError = null;
  
  // Log details about the API call we're about to make
  console.log("Groq API details:", {
    URL: GROQ_CONFIG.API_URL,
    model: GROQ_CONFIG.MODEL,
    apiKeyPresent: !!GROQ_CONFIG.API_KEY,
    apiKeyLength: GROQ_CONFIG.API_KEY?.length || 0,
    maxRetries: GROQ_CONFIG.MAX_RETRIES,
    retryDelay: GROQ_CONFIG.RETRY_DELAY
  });
  
  while (attempts <= GROQ_CONFIG.MAX_RETRIES) {
    try {
      console.log(`Groq API attempt ${attempts + 1}...`);
      
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // Call the Groq API directly - now using consistent error handling
        console.log(`Sending request to Groq API using model: ${GROQ_CONFIG.MODEL}`);
        const response = await fetch(GROQ_CONFIG.API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${GROQ_CONFIG.API_KEY}`
          },
          body: JSON.stringify({
            model: GROQ_CONFIG.MODEL,
            messages: [
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: GROQ_CONFIG.DEFAULT_PARAMS.temperature,
            max_tokens: GROQ_CONFIG.DEFAULT_PARAMS.max_tokens,
            top_p: GROQ_CONFIG.DEFAULT_PARAMS.top_p
          }),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);

        // Check for HTTP errors with enhanced logging
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Groq API HTTP error:", errorText);
          console.error(`Status: ${response.status}, StatusText: ${response.statusText}`);
          
          // More specific error handling
          if (response.status === 401 || response.status === 403) {
            console.error("Authentication error with Groq API - likely invalid API key");
            localStorage.setItem('use_local_groq_fallback', 'true');
            return await generateLocalFallbackResponse(prompt);
          } else if (response.status === 429) {
            console.error("Rate limit exceeded with Groq API");
            if (attempts >= GROQ_CONFIG.MAX_RETRIES) {
              localStorage.setItem('use_local_groq_fallback', 'true');
              return await generateLocalFallbackResponse(prompt);
            }
          } else if (errorText.includes("Content Security Policy")) {
            console.error("CSP error detected with Groq API");
            localStorage.setItem('use_local_groq_fallback', 'true');
            return await generateLocalFallbackResponse(prompt);
          }
          
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        // Parse the response with better error handling
        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          console.error("Failed to parse Groq API response as JSON:", parseError);
          throw new Error("Invalid JSON response from Groq API");
        }
        
        console.log("Groq API raw response:", JSON.stringify(data).substring(0, 200) + "...");
        
        // Extract the response text with more robust error handling
        if (!data.choices || 
            !Array.isArray(data.choices) || 
            data.choices.length === 0 || 
            !data.choices[0].message || 
            !data.choices[0].message.content) {
          console.error("Invalid structure in Groq response:", data);
          
          // Check for fallback message in error
          if (data.fallbackMessage) {
            console.log("Using fallback message from error response");
            return data.fallbackMessage;
          }
          
          throw new Error("Invalid structure in Groq response");
        }
        
        const responseText = data.choices[0].message.content;
        
        // Validate response quality
        if (!responseText || responseText.trim().length < 20) {
          console.error("Empty or too short response from Groq API:", responseText);
          throw new Error("Empty or too short response from Groq API");
        }
        
        console.log("Successful Groq response with length:", responseText.length);
        console.log("Groq response preview:", responseText.substring(0, 100) + "...");
        return responseText;
      } catch (fetchError) {
        // Handle Content Security Policy errors specifically
        if (fetchError.message && (
            fetchError.message.includes("Content Security Policy") ||
            fetchError.message.includes("blocked by CORS policy") ||
            fetchError.message.includes("NetworkError")
        )) {
          console.error("Network or CSP error detected, switching to local fallback:", fetchError);
          localStorage.setItem('use_local_groq_fallback', 'true');
          return await generateLocalFallbackResponse(prompt);
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Groq API attempt ${attempts + 1} failed:`, error);
      
      // Handle timeouts specifically
      if (error.name === 'AbortError') {
        console.error("Groq request timed out after 15 seconds");
      }
      
      if (attempts >= GROQ_CONFIG.MAX_RETRIES) {
        console.error("Max retries reached for Groq API, giving up");
        
        // Try local fallback when all else fails
        try {
          localStorage.setItem('use_local_groq_fallback', 'true');
          return await generateLocalFallbackResponse(prompt);
        } catch (fallbackError) {
          console.error("Even local fallback failed:", fallbackError);
          throw error;
        }
      }
      
      // Exponential backoff
      const delayTime = GROQ_CONFIG.RETRY_DELAY * Math.pow(1.5, attempts);
      console.log(`Retrying Groq API in ${delayTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
      attempts++;
    }
  }
  
  // Final fallback if the while loop exits abnormally
  try {
    return await generateLocalFallbackResponse(prompt);
  } catch (e) {
    throw lastError || new Error("Failed to call Groq API after retries");
  }
};

// Generate content using Groq with enhanced error handling and logging
export const generateGroqContent = async (query: string): Promise<{ text: string, error?: string }> => {
  try {
    // Replace the placeholder with the actual query
    const medicalPrompt = GROQ_MEDICAL_PROMPT.replace("{query}", query);
    
    console.log(`Sending medical query to Groq: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Call Groq API with retries built in
    const response = await callGroqAPI(medicalPrompt);
    console.log("Successfully got Groq response for query");
    return { text: response, source: "groq" };
  } catch (error) {
    console.error("Failed to generate Groq content:", error);
    
    // Create a user-friendly fallback response
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return { 
      text: `I'm sorry, I couldn't retrieve information about your query from either our primary or fallback systems. All AI language models are currently unavailable.\n\n` +
            `1. DISEASE DESCRIPTION\n` +
            `• The system is currently unable to provide details about this condition\n` +
            `• Please try again later or try rephrasing your query\n` +
            `• Error details: ${errorMessage}\n\n` +
            `2. DRUG RECOMMENDATIONS\n` +
            `• Unable to provide medication information at this time\n` +
            `• Please consult with a healthcare professional\n\n` +
            `3. SIDE EFFECTS & INDICATIONS\n` +
            `• Unable to provide side effect information at this time\n\n` +
            `4. CONTRAINDICATIONS & INTERACTIONS\n` +
            `• Unable to provide contraindication information at this time\n\n` +
            `5. HERBAL MEDICINE ALTERNATIVES\n` +
            `• Unable to provide herbal medicine information at this time\n\n` +
            `6. FOOD-BASED TREATMENTS\n` +
            `• Unable to provide food-based treatment information at this time\n\n` +
            `Medical Disclaimer: This is an automated fallback message. Please consult a healthcare professional for medical advice.`,
      error: errorMessage,
      source: "local-fallback"
    };
  }
};
