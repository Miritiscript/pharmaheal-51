
export const GROQ_CONFIG = {
  API_URL: "https://api.groq.com/openai/v1/chat/completions",
  MODEL: "llama-3.1-70b-versatile", // Using Llama 3.1 70B model which is equivalent to the requested model
  DEFAULT_PARAMS: {
    temperature: 0.7,
    max_tokens: 4096,
    top_p: 1.0
  },
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
} as const;

export const GROQ_MEDICAL_PROMPT = `
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

DO NOT leave out any sections. DO NOT return an empty response. If the query is unclear, interpret it as best as possible and provide general medical information related to the topic.`;

