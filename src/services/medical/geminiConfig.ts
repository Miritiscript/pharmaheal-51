
export const GEMINI_CONFIG = {
  API_KEY: "AIzaSyCJz7f2etksZsZLK2vsiUmCxIcAb5fHDp4",
  API_URL: "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent",
  DEFAULT_PARAMS: {
    temperature: 0.6,  // Increased temperature slightly for more diverse responses
    topK: 32,
    topP: 1.0,         // Increased to maximum for wider response distribution
    maxOutputTokens: 2048,  // Increased token limit for more comprehensive responses
  },
  MAX_RETRIES: 3,      // Increased retries
  RETRY_DELAY: 1500    // Increased delay between retries
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

Use bullet points (•) for all information. Each section should provide 3-5 relevant points.
Include a medical disclaimer.

IMPORTANT: Provide information for ANY medical condition or disease asked about, including but not limited to: cancer types (leukemia, lymphoma, etc), rare diseases, chronic conditions, mental health disorders, and infectious diseases.`;

// Updated to produce better structured JSON output
export const RELEVANCE_CHECK_PROMPT = `
You are a medical query validator that ONLY outputs valid JSON.

Determine if the query "{query}" is related to human health, medical conditions, medications, treatments, or wellness.

Output ONLY a JSON object with exactly this format, no markdown, no comments, no explanations:
{"isRelevant": true/false, "reason": "brief explanation"}

For ANY disease, condition name, or medication name, the answer should ALWAYS be {"isRelevant": true, "reason": "Query is about a medical condition"}.
`;
