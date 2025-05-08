
export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY",
  API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
  DEFAULT_PARAMS: {
    temperature: 0.7,  // Adjusted for even more diverse responses
    topK: 40,
    topP: 1.0,         // Maximum for wide response distribution
    maxOutputTokens: 4096,  // Doubled token limit for more comprehensive responses
  },
  MAX_RETRIES: 5,      // Increased retries further
  RETRY_DELAY: 1000    // Slightly decreased delay for faster retries
} as const;

export const MEDICAL_PROMPT_TEMPLATE = `
As a comprehensive medical AI assistant, provide detailed information about: "{query}"

Format your response with these sections using bullet points:

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

IMPORTANT: You MUST include all 6 sections with content in your response. If information for a section is not available, provide general advice related to that category.

DO NOT leave out any sections. DO NOT return an empty response. If the query is unclear, interpret it as best as possible and provide general medical information related to the topic.`;

// Updated to guarantee valid JSON output using a simplified format
export const RELEVANCE_CHECK_PROMPT = `
You are a medical query validator that ONLY outputs valid JSON.

Determine if the query "{query}" is related to human health, medical conditions, medications, treatments, or wellness.

Output ONLY a JSON object in this exact format with no other text:
{"isRelevant": true/false, "reason": "brief explanation"}

For any disease, medication, or symptom name, ALWAYS return:
{"isRelevant": true, "reason": "Query is about a medical topic"}
`;
