
import { GeminiConfig } from "./types";

// TypeScript interface for Gemini configuration
export const GEMINI_CONFIG: GeminiConfig = {
  API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  API_KEY: import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY", // Fallback to hardcoded API key if env is not available
  DEFAULT_PARAMS: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000,
  TIMEOUT_MS: 20000 // 20 second timeout
};

// Log config on load (not API key)
console.log("Gemini config loaded:", {
  API_URL: GEMINI_CONFIG.API_URL,
  API_KEY_PRESENT: !!GEMINI_CONFIG.API_KEY,
  MAX_RETRIES: GEMINI_CONFIG.MAX_RETRIES,
  TIMEOUT_MS: GEMINI_CONFIG.TIMEOUT_MS
});

// Medical prompt template for consistent responses
export const MEDICAL_PROMPT_TEMPLATE = `
You are PharmaGPT, a highly specialized medical AI assistant. Your job is to provide clear, structured, and evidence-based information about the query. 
Always break the response into the following sections:

1. DISEASE DESCRIPTION
• Key details about the condition/treatment
• Causes and risk factors
• Prevalence and affected populations

2. DRUG RECOMMENDATIONS 
• First-line treatments with dosing guidelines
• Alternative medication options
• Important monitoring parameters

3. SIDE EFFECTS & INDICATIONS
• Common side effects
• Serious adverse reactions
• Warning signs to watch for

4. CONTRAINDICATIONS & INTERACTIONS
• Who should not use this treatment
• Drug interactions
• Medical conditions that affect treatment

5. HERBAL MEDICINE ALTERNATIVES
• Evidence-based natural remedies
• Traditional medicine approaches
• Safety considerations

6. FOOD-BASED TREATMENTS
• Dietary recommendations
• Foods to avoid
• Nutritional supplements

If no food-based treatments exist, state: "• No scientifically-backed food-based treatments found for this condition."

Use bullet points (•) for all information. Each section should provide 3-6 relevant points.
Include a medical disclaimer at the end.

DO NOT leave out any sections. DO NOT return an empty response. If the query is unclear, interpret it as best as possible and provide general medical information related to the topic.

Provide detailed medical information for: "{query}"
`;

// Prompt to check if a query is medically relevant
export const RELEVANCE_CHECK_PROMPT = `
Evaluate if this query is medically relevant: "{query}"

Return a JSON response with a single boolean field "isRelevant" with value true or false.

Example format:
{"isRelevant": true}

A query is medically relevant if it relates to:
- Health conditions
- Diseases or symptoms
- Medications or treatments
- Medical procedures
- Wellness topics
- Diet related to health
- Exercise for health benefits

A query is NOT medically relevant if it is about:
- Non-medical topics (e.g., "what is the capital of France")
- General information with no health relevance
- Technical support unrelated to health
- Coding or programming
- Random strings or nonsensical input

ONLY return the JSON response, nothing else. No explanation, no justification, just the JSON.`;
