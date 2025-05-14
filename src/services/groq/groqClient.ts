
import { GROQ_CONFIG, GROQ_MEDICAL_PROMPT } from './groqConfig';
import { generateLocalFallbackResponse } from '../medical/localFallback';

/**
 * Calls the Groq API with retry mechanism
 */
export const callGroqAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Groq API with prompt:", prompt.substring(0, 100) + "...");
  
  // Check if we need to use local fallback
  const useLocalFallback = !GROQ_CONFIG.API_KEY || import.meta.env.DEV || localStorage.getItem('use_local_groq_fallback') === 'true';
  
  if (useLocalFallback) {
    console.log("Using local fallback for Groq API (no API key or in development mode)");
    return await generateLocalFallbackResponse(prompt);
  }
  
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= GROQ_CONFIG.MAX_RETRIES) {
    try {
      console.log(`Groq API attempt ${attempts + 1}...`);
      
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      try {
        // Call the Groq API directly
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

        // Check for HTTP errors
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Groq API HTTP error:", errorText);
          console.error(`Status: ${response.status}, StatusText: ${response.statusText}`);
          
          // If we got a 401/403 error or CSP error, enable local fallback for next time
          if (response.status === 401 || response.status === 403 || errorText.includes("Content Security Policy")) {
            console.log("Enabling local fallback mode for future requests due to auth/CSP error");
            localStorage.setItem('use_local_groq_fallback', 'true');
            
            // Try to use local fallback this time too
            return await generateLocalFallbackResponse(prompt);
          }
          
          throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }

        // Parse the response
        const data = await response.json();
        
        console.log("Groq API raw response:", JSON.stringify(data).substring(0, 200) + "...");
        
        // Extract the response text
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          console.error("Invalid structure in Groq response:", data);
          
          // Check for fallback message in error
          if (data.fallbackMessage) {
            console.log("Using fallback message from error response");
            return data.fallbackMessage;
          }
          
          throw new Error("Invalid structure in Groq response");
        }
        
        const responseText = data.choices[0].message.content;
        
        if (!responseText || responseText.trim().length < 20) {
          console.error("Empty or too short response from Groq API:", responseText);
          throw new Error("Empty or too short response from Groq API");
        }
        
        console.log("Successful Groq response length:", responseText.length);
        console.log("Groq response preview:", responseText.substring(0, 100) + "...");
        return responseText;
      } catch (fetchError) {
        // Handle Content Security Policy errors specifically
        if (fetchError.message && fetchError.message.includes("Content Security Policy")) {
          console.error("CSP error detected, switching to local fallback:", fetchError);
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

// Generate content using Groq
export const generateGroqContent = async (query: string): Promise<{ text: string, error?: string }> => {
  try {
    // Replace the placeholder with the actual query
    const medicalPrompt = GROQ_MEDICAL_PROMPT.replace("{query}", query);
    
    console.log(`Sending medical query to Groq fallback: "${query.substring(0, 50)}${query.length > 50 ? '...' : ''}"`);
    
    // Call Groq API with retries built in
    const response = await callGroqAPI(medicalPrompt);
    return { text: response };
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
      error: errorMessage
    };
  }
};
