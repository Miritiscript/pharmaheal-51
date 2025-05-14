import { GEMINI_CONFIG } from './geminiConfig';
import { generateGroqContent } from '../groq/groqClient';

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
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), GEMINI_CONFIG.TIMEOUT_MS);
      
      // API Key debug
      const apiKey = GEMINI_CONFIG.API_KEY || "";
      console.log(`Using API Key: ${apiKey ? "Key available (length: " + apiKey.length + ")" : "No API key found!"}`);
      
      // Model debug
      console.log(`API URL: ${GEMINI_CONFIG.API_URL}`);
      
      // Request debug - don't log the actual API key
      console.log(`Request URL: ${GEMINI_CONFIG.API_URL}?key=API_KEY_REDACTED`);
      
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
      
      console.log("Request body:", JSON.stringify(requestBody).substring(0, 200) + "...");
      
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

      // Check for HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` }}));
        console.error("Gemini API HTTP error:", errorData);
        console.error(`Status: ${response.status}, StatusText: ${response.statusText}`);
        throw new Error(errorData.error?.message || `HTTP error ${response.status}: ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      
      // Log the raw response for debugging
      console.log("Gemini API raw response success:", JSON.stringify(data).substring(0, 200) + "...");
      
      // Enhanced extraction and validation of response text
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error("Invalid response structure from Gemini API:", data);
        throw new Error("Invalid response structure from Gemini API");
      }
      
      const responseText = data.candidates[0].content.parts[0].text;
      
      if (!responseText || responseText.trim().length < 20) {
        console.error("Empty or too short response from Gemini API:", responseText);
        throw new Error("Empty or too short response from Gemini API");
      }
      
      console.log("Successful response length:", responseText.length);
      console.log("Response preview:", responseText.substring(0, 100) + "...");
      return responseText;
    } catch (error) {
      lastError = error;
      console.warn(`Gemini API attempt ${attempts + 1} failed:`, error);
      
      // Handle timeouts specifically
      if (error.name === 'AbortError') {
        console.error("Request timed out after", GEMINI_CONFIG.TIMEOUT_MS, "ms");
      }
      
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
// Now with Groq fallback
export const generateGeminiContent = async (query: string): Promise<{ text: string, error?: string }> => {
  try {
    // Import the medical prompt template from config
    const { MEDICAL_PROMPT_TEMPLATE } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const medicalPrompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", query);
    
    console.log(`Sending medical query to Gemini: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Try to get a response with retries built in
    try {
      const response = await callGeminiAPI(medicalPrompt);
      
      // Validate the response contains the expected format
      // This is a simple check to see if the response has bullet points and section headers
      if (response.includes("•") && 
          (response.includes("DISEASE DESCRIPTION") || 
           response.includes("DRUG RECOMMENDATIONS"))) {
        return { text: response };
      } else {
        console.warn("Gemini response does not match expected format, falling back to Groq");
        throw new Error("Invalid response format");
      }
    } catch (geminiError) {
      console.error("Gemini API failed, falling back to Groq:", geminiError);
      
      // If Gemini fails, try Groq as a fallback
      console.log("Using Groq as fallback for query:", query);
      return await generateGroqContent(query);
    }
  } catch (error) {
    console.error("Failed to generate content with both Gemini and Groq:", error);
    
    // Ultimate fallback if both providers fail
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Final error message:", errorMessage);
    
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
      error: errorMessage
    };
  }
};

// Check if a query is medically relevant with completely redesigned parsing logic
export const checkMedicalRelevance = async (query: string): Promise<boolean> => {
  try {
    // Import the relevance check prompt from config
    const { RELEVANCE_CHECK_PROMPT } = await import('./geminiConfig');
    
    // Replace the placeholder with the actual query
    const relevanceCheckPrompt = RELEVANCE_CHECK_PROMPT.replace("{query}", query);
    
    // Call the Gemini API with the relevance check prompt
    console.log(`Checking relevance for: "${query}"`);
    const response = await callGeminiAPI(relevanceCheckPrompt);
    console.log("Raw relevance response:", response);
    
    // New multi-stage parsing approach:
    
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
    
    // Stage 2: Direct JSON extraction with multiple patterns
    try {
      // Pattern 1: Look for valid JSON object with curly braces
      const jsonMatch = response.match(/(\{.*?\})/s);
      if (jsonMatch && jsonMatch[0]) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (typeof parsed.isRelevant === 'boolean') {
            console.log("Successfully extracted JSON with isRelevant:", parsed);
            return parsed.isRelevant;
          }
        } catch (e) {
          console.warn("Failed to parse extracted JSON object:", e);
        }
      }
      
      // Pattern 2: Look for true/false values
      if (response.includes('"isRelevant": true') || response.includes('"isRelevant":true')) {
        console.log("Found isRelevant:true pattern in response");
        return true;
      }
      
      if (response.includes('"isRelevant": false') || response.includes('"isRelevant":false')) {
        console.log("Found isRelevant:false pattern in response");
        return false;
      }
      
      // Stage 3: Clean response and try again with more permissive approach
      const cleanedResponse = response
        .replace(/```json|```/g, '')
        .replace(/(\r\n|\n|\r)/gm, '')
        .trim();
      
      // Look for any valid JSON object in the cleaned response
      const matches = cleanedResponse.match(/\{[^{}]*\}/g);
      if (matches) {
        for (const match of matches) {
          try {
            const parsed = JSON.parse(match);
            if (typeof parsed.isRelevant === 'boolean') {
              console.log("Successfully extracted JSON from cleaned response:", parsed);
              return parsed.isRelevant;
            }
          } catch (e) {
            console.warn("Failed to parse JSON match from cleaned response");
          }
        }
      }
    } catch (jsonError) {
      console.warn("All JSON parsing attempts failed:", jsonError);
    }
    
    // Stage 4: Fall back to text-based analysis of the response
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
    
    // Stage 5: Default fallback - a last-resort attempt
    // Query length heuristic: longer queries are more likely to be legitimate
    if (query.length > 15 || query.split(' ').length > 2) {
      console.log("Defaulting to accept based on query complexity");
      return true;
    }
    
    console.log("Query determined to be non-medical after exhausting all checks");
    return false;
  } catch (error) {
    console.error("Error checking medical relevance:", error);
    // Default to accepting the query if there's an error with the API
    console.log("Accepting query due to relevance check error");
    return true;
  }
};
