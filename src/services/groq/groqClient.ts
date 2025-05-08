import { GROQ_CONFIG, GROQ_MEDICAL_PROMPT } from './groqConfig';

/**
 * Calls the Groq API with retry mechanism
 */
export const callGroqAPI = async (prompt: string): Promise<string> => {
  console.log("Calling Groq API with prompt:", prompt.substring(0, 100) + "...");
  
  // We'll use the fetch API with the SUPABASE_FUNCTIONS_URL environment variable
  // This approach allows us to keep the API key secure
  let attempts = 0;
  let lastError = null;
  
  while (attempts <= GROQ_CONFIG.MAX_RETRIES) {
    try {
      console.log(`Groq API attempt ${attempts + 1}...`);
      
      // Call the Supabase Edge Function that will make the actual Groq API request
      const response = await fetch("/api/groq-fallback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      });

      // Check for HTTP errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq API HTTP error:", errorText);
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      // Parse the response
      const data = await response.json();
      
      console.log("Groq API raw response:", JSON.stringify(data).substring(0, 200) + "...");
      
      // Extract the response text
      const responseText = data.choices[0].message.content;
      
      if (!responseText || responseText.trim().length < 20) {
        console.error("Empty or too short response from Groq API:", responseText);
        throw new Error("Empty or too short response from Groq API");
      }
      
      console.log("Successful Groq response length:", responseText.length);
      console.log("Groq response preview:", responseText.substring(0, 100) + "...");
      return responseText;
    } catch (error) {
      lastError = error;
      console.warn(`Groq API attempt ${attempts + 1} failed:`, error);
      
      if (attempts >= GROQ_CONFIG.MAX_RETRIES) {
        console.error("Max retries reached for Groq API, giving up");
        throw error;
      }
      
      // Exponential backoff
      const delayTime = GROQ_CONFIG.RETRY_DELAY * Math.pow(1.5, attempts);
      console.log(`Retrying Groq API in ${delayTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, delayTime));
      attempts++;
    }
  }
  
  throw lastError || new Error("Failed to call Groq API after retries");
};

// Generate content using Groq
export const generateGroqContent = async (query: string): Promise<{ text: string }> => {
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
    if (error instanceof Error) {
      return { 
        text: `I'm sorry, I couldn't retrieve information about your query from either our primary or fallback systems. All AI language models are currently unavailable.\n\n` +
              `Please try again later or contact our support team.\n\n` +
              `Error details: ${error.message}\n\n` +
              `Medical Disclaimer: This is an automated fallback message. Please consult a healthcare professional for medical advice.`
      };
    }
    
    throw error;
  }
};
