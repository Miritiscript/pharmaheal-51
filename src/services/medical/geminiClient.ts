import { GEMINI_CONFIG, GEMINI_MEDICAL_PROMPT, GEMINI_RELEVANCE_PROMPT } from './geminiConfig';
import { generateLocalFallbackResponse } from './localFallback';

/**
 * Calls the Gemini API with enhanced retry mechanism
 */
export const callGeminiAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Gemini API with prompt:", prompt.substring(0, 100) + "...");
  
  // Check if we need to use local fallback (no API key available)
  const apiKey = GEMINI_CONFIG.API_KEY || "";
  
  // More robust validation of API key
  if (!apiKey || apiKey.length < 10) {
    console.warn("No valid Gemini API key available, key length:", apiKey.length);
    throw new Error("Invalid or missing Gemini API key");
  }
  
  // Enhanced logging of API details (without exposing the key)
  console.log("Gemini API details:", {
    URL: GEMINI_CONFIG.API_URL,
    apiKeyPresent: !!apiKey,
    apiKeyLength: apiKey.length,
    maxRetries: GEMINI_CONFIG.MAX_RETRIES,
    timeout: GEMINI_CONFIG.TIMEOUT_MS
  });
  
  // Implement retry logic with better tracking
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= GEMINI_CONFIG.MAX_RETRIES) {
    try {
      console.log(`Gemini API attempt ${attempts + 1}...`);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT_MS);
      
      // Format the request body
      const requestBody = {
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
      };
      
      console.log("Request body format:", Object.keys(requestBody));
      
      // Make actual API call
      try {
        const response = await fetch(`${GEMINI_CONFIG.API_URL}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal
        });
        
        // Clear the timeout since we got a response
        clearTimeout(timeoutId);

        // Detailed logging for HTTP status
        console.log(`Gemini API response status: ${response.status} ${response.statusText}`);

        // Check for HTTP errors with enhanced logging
        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: { message: `HTTP error ${response.status}` }};
          }
          
          console.error("Gemini API HTTP error details:", errorData);
          
          // Specific error handling for common issues
          if (response.status === 403) {
            console.error("API key authentication error. Key may be invalid or expired.");
            throw new Error("Gemini API key authentication failed");
          } else if (response.status === 429) {
            console.error("Gemini API quota exceeded or rate limit hit");
            throw new Error("Gemini API rate limit exceeded");
          }
          
          throw new Error(errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`);
        }

        // Parse the response with better error handling
        let data;
        try {
          data = await response.json();
          console.log("Successfully parsed Gemini response JSON");
        } catch (parseError) {
          console.error("Failed to parse Gemini API response as JSON:", parseError);
          throw new Error("Invalid JSON response from Gemini API");
        }
        
        // Log structure of the response for debugging
        console.log("Gemini API response structure:", 
          data ? 
          `Contains candidates: ${!!data.candidates}, ` +
          `First candidate has content: ${!!(data.candidates?.[0]?.content)}` : 
          "No data"
        );
        
        // Enhanced extraction and validation of response text
        if (!data.candidates || 
            !Array.isArray(data.candidates) || 
            data.candidates.length === 0 || 
            !data.candidates[0].content || 
            !data.candidates[0].content.parts || 
            !data.candidates[0].content.parts[0]) {
          console.error("Invalid response structure from Gemini API:", 
            JSON.stringify(data).substring(0, 500));
          throw new Error("Invalid response structure from Gemini API");
        }
        
        const responseText = data.candidates[0].content.parts[0].text;
        
        if (!responseText || responseText.trim().length < 20) {
          console.error("Empty or too short response from Gemini API:", responseText);
          throw new Error("Empty or too short response from Gemini API");
        }
        
        console.log("Successful Gemini response with length:", responseText.length);
        console.log("Gemini response preview:", responseText.substring(0, 100) + "...");
        return responseText;
      } catch (fetchError) {
        // If fetch itself failed (not a response status error)
        clearTimeout(timeoutId);
        
        // Enhanced CORS/CSP error detection
        if (fetchError.message && (
            fetchError.message.includes("Content Security Policy") ||
            fetchError.message.includes("blocked by CORS policy") ||
            fetchError.message.includes("NetworkError") ||
            fetchError.name === 'TypeError'
        )) {
          console.error("Network, CORS or CSP error with Gemini API:", fetchError);
          throw new Error(`Network connectivity issue with Gemini API: ${fetchError.message}`);
        }
        
        throw fetchError;
      }
    } catch (error) {
      lastError = error;
      console.warn(`Gemini API attempt ${attempts + 1} failed:`, error);
      
      // Handle timeouts specifically
      if (error.name === 'AbortError') {
        console.error("Request timed out after", GEMINI_CONFIG.TIMEOUT_MS, "ms");
      }
      
      // If we've reached max retries, throw the error
      if (attempts >= GEMINI_CONFIG.MAX_RETRIES) {
        console.error("Max retries reached, giving up on Gemini API");
        throw error;
      }
      
      // Otherwise wait and retry with exponential backoff
      const delayTime = GEMINI_CONFIG.RETRY_DELAY * Math.pow(1.5, attempts);
      console.log(`Retrying Gemini API in ${delayTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
      attempts++;
    }
  }
  
  // This should never happen due to the throw in the loop, but TypeScript doesn't know that
  throw lastError || new Error("Failed to call Gemini API after retries");
};

/**
 * Check if a query is medically relevant using Gemini
 */
export const checkMedicalRelevance = async (query: string): Promise<boolean> => {
  try {
    // Import the relevance check prompt from config
    const { RELEVANCE_CHECK_PROMPT } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const relevanceCheckPrompt = RELEVANCE_CHECK_PROMPT.replace("{query}", query);
    
    // Call the Gemini API with the relevance check prompt
    console.log(`Checking relevance for: "${query}"`);
    
    try {
      const response = await callGeminiAPI(relevanceCheckPrompt);
      console.log("Raw relevance response:", response);
      
      // Enhanced parsing logic with better error handling
      
      // Stage 1: Check if any keywords in the query are obviously medical
      const medicalKeywords = [
        'disease', 'treatment', 'symptom', 'medication', 'drug',
        'cancer', 'leukemia', 'therapy', 'diagnosis', 'syndrome',
        'infection', 'virus', 'bacterial', 'diet', 'health',
        'medicine', 'prescription', 'hospital', 'doctor', 'patient',
        'condition', 'chronic', 'acute', 'pain', 'inflammation',
        'diabetes', 'asthma', 'hypertension', 'arthritis'
      ];
      
      const queryLower = query.toLowerCase();
      for (const keyword of medicalKeywords) {
        if (queryLower.includes(keyword)) {
          console.log(`Query contains medical keyword: ${keyword}`);
          return true;
        }
      }
      
      // Multi-step JSON extraction with robust error handling
      try {
        // Try several JSON extraction methods
        let parsed = null;
        
        // Method 1: Try direct JSON.parse if the response looks like JSON
        if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
          try {
            parsed = JSON.parse(response.trim());
            if (typeof parsed.isRelevant === 'boolean') {
              console.log("Successfully parsed JSON directly:", parsed);
              return parsed.isRelevant;
            }
          } catch (e) {
            console.warn("Failed direct JSON parsing");
          }
        }
        
        // Method 2: Look for JSON pattern with regex
        const jsonMatch = response.match(/(\{.*?\})/s);
        if (jsonMatch && jsonMatch[0]) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
            if (typeof parsed.isRelevant === 'boolean') {
              console.log("Successfully extracted JSON with regex:", parsed);
              return parsed.isRelevant;
            }
          } catch (e) {
            console.warn("Failed regex JSON extraction");
          }
        }
        
        // Method 3: Look for true/false patterns
        if (response.includes('"isRelevant": true') || 
            response.includes('"isRelevant":true') || 
            response.includes('{"isRelevant":true}')) {
          console.log("Found isRelevant:true pattern in response");
          return true;
        }
        
        if (response.includes('"isRelevant": false') || 
            response.includes('"isRelevant":false') ||
            response.includes('{"isRelevant":false}')) {
          console.log("Found isRelevant:false pattern in response");
          return false;
        }
        
        // Method 4: Clean response and try more aggressive parsing
        const cleanedResponse = response
          .replace(/```json|```/g, '')
          .replace(/(\r\n|\n|\r)/gm, '')
          .trim();
        
        // Look for any valid JSON object in the cleaned response
        const matches = cleanedResponse.match(/\{[^{}]*\}/g);
        if (matches) {
          for (const match of matches) {
            try {
              parsed = JSON.parse(match);
              if (typeof parsed.isRelevant === 'boolean') {
                console.log("Successfully extracted JSON from cleaned response:", parsed);
                return parsed.isRelevant;
              }
            } catch (e) {
              console.warn("Failed to parse JSON match from cleaned response");
            }
          }
        }
        
        console.log("All JSON parsing attempts failed, falling back to text analysis");
      } catch (jsonError) {
        console.warn("All structured parsing attempts failed:", jsonError);
      }
      
      // Fallback to text-based analysis
      const positiveIndicators = ['yes', 'relevant', 'medical', 'health', 'true', 'valid'];
      const negativeIndicators = ['no', 'not relevant', 'non-medical', 'false', 'invalid'];
      
      let positiveScore = 0;
      let negativeScore = 0;
      
      const responseLower = response.toLowerCase();
      
      positiveIndicators.forEach(indicator => {
        if (responseLower.includes(indicator)) positiveScore++;
      });
      
      negativeIndicators.forEach(indicator => {
        if (responseLower.includes(indicator)) negativeScore++;
      });
      
      console.log(`Text-based relevance analysis: Positive=${positiveScore}, Negative=${negativeScore}`);
      
      // If more positive than negative indicators, consider it relevant
      if (positiveScore > negativeScore) {
        return true;
      }
      
      // Final fallback - accept longer, more complex queries by default
      if (query.length > 15 || query.split(' ').length > 2) {
        console.log("Defaulting to accept based on query complexity");
        return true;
      }
      
      console.log("Query determined to be non-medical after exhausting all checks");
      return false;
    } catch (apiError) {
      // If API call fails, assume query is medical by default (fail open)
      console.log("API call failed for relevance check, assuming query is medically relevant:", apiError);
      return true;
    }
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    // Default to accepting the query if there's an error (fail open)
    console.log("Accepting query due to relevance check error");
    return true;
  }
};

/**
 * Generate content using Gemini AI
 */
export const generateGeminiContent = async (query: string): Promise<{ text: string, error?: string, source?: string }> => {
  try {
    // Import the medical prompt template from config
    const { MEDICAL_PROMPT_TEMPLATE } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const medicalPrompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", query);
    
    console.log(`Attempting primary Gemini service with query: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Try to get a response from Gemini with retries built in
    try {
      console.log("Attempting Gemini API call...");
      const response = await callGeminiAPI(medicalPrompt);
      
      // Validate the response contains the expected format with enhanced logging
      console.log("Validating Gemini response format...");
      
      // This is a simple check to see if the response has bullet points and section headers
      const hasExpectedFormat = response.includes("•") && 
        (response.includes("DISEASE DESCRIPTION") || 
         response.includes("DRUG RECOMMENDATIONS"));
      
      if (!hasExpectedFormat) {
        console.warn("Gemini response does not match expected format:", 
          response.substring(0, 200) + "...");
        console.log("Falling back to Groq due to invalid response format");
        throw new Error("Invalid response format from Gemini");
      }
      
      console.log("Successfully validated Gemini response");
      
      // Update to include source property
      return { text: response, source: "gemini" };
    } catch (geminiError) {
      console.error("Gemini API failed, detailed error:", geminiError);
      console.log("Falling back to Groq API...");
      
      // If Gemini fails, try Groq as a fallback
      try {
        console.log("Using Groq as fallback for query:", query);
        const groqResponse = await generateGroqContent(query);
        console.log("Successfully retrieved Groq fallback response");
        return { ...groqResponse, source: "groq" };
      } catch (groqError) {
        console.error("Both Gemini and Groq APIs failed:", groqError);
        throw new Error(`Both primary and secondary AI services failed: ${geminiError.message} / ${groqError.message}`);
      }
    }
  } catch (error) {
    console.error("Failed to generate content with both Gemini and Groq:", error);
    
    // Ultimate fallback if both providers fail - generate response locally
    try {
      console.log("Using local fallback as last resort...");
      const fallbackResponse = await generateLocalFallbackResponse(query);
      console.log("Successfully generated local fallback response");
      return { text: fallbackResponse, source: "local-fallback" };
    } catch (localFallbackError) {
      // If even local fallback fails, return a simple error message
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Final error - even local fallback failed:", localFallbackError);
      
      return { 
        text: `I'm sorry, I couldn't retrieve information about your query. All AI services are currently experiencing issues.\n\n` +
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
        source: "error-fallback"
      };
    }
  }
};
