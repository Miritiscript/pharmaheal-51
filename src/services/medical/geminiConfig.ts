
export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY",
  API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
  DEFAULT_PARAMS: {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 1024,
  },
  MAX_RETRIES: 2,
  RETRY_DELAY: 1000 // ms
} as const;

export const MEDICAL_PROMPT_TEMPLATE = `
As a medical AI assistant, provide comprehensive information about: "{query}"

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

Use bullet points (•) for all information. Each section should provide 3-5 relevant points.
Include a medical disclaimer.`;

// Simplified JSON-based relevance check prompt that produces cleaner JSON
export const RELEVANCE_CHECK_PROMPT = `
You are a medical query validator.

Is the query "{query}" related to human health, medical conditions, medications, treatments, or wellness?

Return ONLY a JSON object with this exact format:
{
  "isRelevant": true/false,
  "reason": "brief explanation"
}

Example valid response for "aspirin dosage":
{
  "isRelevant": true,
  "reason": "Query is about medication dosage"
}

Example valid response for "how to bake cookies":
{
  "isRelevant": false,
  "reason": "Query is about cooking, not medical"
}
`;
