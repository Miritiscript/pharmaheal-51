import { validateMedicalQuery, normalizeQuery } from './medical/queryValidator';
import { DISEASE_ALIAS_MAP } from './medical/diseaseAliases';

export interface GeminiResponse {
  text: string;
  categories?: {
    diseaseDescription?: string;
    drugRecommendations?: string;
    sideEffects?: string;
    contraindications?: string;
    herbalAlternatives?: string;
    foodBasedTreatments?: string;
  };
}

const GEMINI_API_KEY = "AIzaSyA9rB0nj_ogIj3t_wh8IWlLstVGKqwnbuY";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent";

export const generatePharmacyResponse = async (query: string): Promise<GeminiResponse> => {
  const validation = validateMedicalQuery(query);
  
  if (!validation.isValid) {
    throw new Error(validation.suggestion || "Please enter a valid medical query.");
  }

  // If there's a suggestion but query is still valid, log it for potential follow-up
  if (validation.suggestion) {
    console.log("Query accepted but might need clarification:", validation.suggestion);
  }

  // Enhanced query processing
  const normalizedQuery = normalizeQuery(query);
  let enhancedQuery = query;

  // Check for known medical abbreviations and expand them
  Object.entries(DISEASE_ALIAS_MAP).forEach(([abbrev, fullTerm]) => {
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    if (regex.test(normalizedQuery)) {
      enhancedQuery = enhancedQuery.replace(regex, fullTerm);
      console.log(`Expanded medical term: ${abbrev} -> ${fullTerm}`);
    }
  });

  try {
    const prompt = `
As a medical AI assistant, provide comprehensive information about: "${enhancedQuery}"

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

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      throw new Error(data.error?.message || "Failed to get response from Gemini API");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const categories = parseCategories(text);

    return {
      text,
      categories,
    };
  } catch (error) {
    console.error("Error generating pharmacy response:", error);
    throw error;
  }
};

// Helper function to parse response categories
const parseCategories = (text: string): GeminiResponse["categories"] => {
  const categories: GeminiResponse["categories"] = {};
  
  // Extract sections based on headers
  const diseaseDescriptionMatch = text.match(/DISEASE DESCRIPTION:?([\s\S]*?)(?=DRUG RECOMMENDATIONS|$)/i);
  const drugRecommendationsMatch = text.match(/DRUG RECOMMENDATIONS:?([\s\S]*?)(?=SIDE EFFECTS|$)/i);
  const sideEffectsMatch = text.match(/SIDE EFFECTS[^:]*:?([\s\S]*?)(?=CONTRAINDICATIONS|$)/i);
  const contraindicationsMatch = text.match(/CONTRAINDICATIONS[^:]*:?([\s\S]*?)(?=HERBAL MEDICINE|$)/i);
  const herbalAlternativesMatch = text.match(/HERBAL MEDICINE[^:]*:?([\s\S]*?)(?=FOOD-BASED|$)/i);
  const foodBasedTreatmentsMatch = text.match(/FOOD-BASED TREATMENTS:?([\s\S]*?)(?=\n\n|$)/i);
  
  if (diseaseDescriptionMatch?.[1]) categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
  if (drugRecommendationsMatch?.[1]) categories.drugRecommendations = drugRecommendationsMatch[1].trim();
  if (sideEffectsMatch?.[1]) categories.sideEffects = sideEffectsMatch[1].trim();
  if (contraindicationsMatch?.[1]) categories.contraindications = contraindicationsMatch[1].trim();
  if (herbalAlternativesMatch?.[1]) categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
  if (foodBasedTreatmentsMatch?.[1]) categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
  
  return categories;
};
