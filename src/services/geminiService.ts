
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
  console.log("Processing medical query:", query);
  
  // Enhanced query validation - now much more permissive
  const validation = validateMedicalQuery(query);
  
  // Log validation result for debugging
  console.log("Query validation result:", validation);
  
  if (!validation.isValid) {
    // This should rarely happen with our new system
    console.error("Query rejected as non-medical:", query);
    console.error("Rejection reason:", validation.suggestion);
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
    // Look for whole word matches with word boundaries
    const regex = new RegExp(`\\b${abbrev}\\b`, 'gi');
    if (regex.test(normalizedQuery)) {
      enhancedQuery = enhancedQuery.replace(regex, fullTerm);
      console.log(`Expanded medical term: ${abbrev} -> ${fullTerm}`);
    }
  });

  try {
    // Prepare the prompt with our enhanced query
    const prompt = MEDICAL_PROMPT_TEMPLATE.replace("{query}", enhancedQuery);
    
    // Log the prompt for debugging
    console.log("Sending prompt to Gemini API:", prompt.substring(0, 100) + "...");
    
    // Call the Gemini API
    const text = await callGeminiAPI(prompt);
    
    // Parse the response into categories
    const categories = parseCategories(text);

    // Return the structured response
    return {
      text,
      categories,
    };
  } catch (error) {
    console.error("Error generating pharmacy response:", error);
    throw error;
  }
};
