
import { validateMedicalQuery, normalizeQuery } from './medical/queryValidator';
import { DISEASE_ALIAS_MAP } from './medical/diseaseAliases';
import { parseCategories } from './medical/responseParser';
import { callGeminiAPI } from './medical/geminiClient';
import { MEDICAL_PROMPT_TEMPLATE } from './medical/geminiConfig';

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
    const prompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", enhancedQuery);
    const text = await callGeminiAPI(prompt);
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
