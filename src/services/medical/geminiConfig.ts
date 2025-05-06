
export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY",
  API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
  DEFAULT_PARAMS: {
    temperature: 0.4,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 1024,
  }
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

// Updated JSON-based relevance check prompt
export const RELEVANCE_CHECK_PROMPT = `
You are a medical relevance filter.

Return a JSON object indicating whether the query below is clearly related to:
- Human health
- Diseases or conditions
- Medications
- Drug side effects, indications, contraindications
- Herbal or natural treatments
- Food or dietary health

Respond ONLY with the following JSON format:
{
  "isRelevant": true or false,
  "reason": "brief explanation"
}

Query: "{query}"
`;

