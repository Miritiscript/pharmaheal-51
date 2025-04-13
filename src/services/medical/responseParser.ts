
import { GeminiResponse } from "../geminiService";

/**
 * Parses the raw Gemini API response into structured categories
 */
export function parseGeminiResponse(response: string): GeminiResponse['categories'] {
  // Default structure for categorized response
  const categories: GeminiResponse['categories'] = {
    diseaseDescription: undefined,
    drugRecommendations: undefined,
    sideEffects: undefined,
    contraindications: undefined,
    herbalAlternatives: undefined,
    foodBasedTreatments: undefined
  };

  try {
    // Process unformatted content into sections
    // Extract disease description (section 1)
    const diseaseMatch = response.match(/1\.?\s*DISEASE DESCRIPTION\s*([\s\S]*?)(?=2\.?\s*DRUG RECOMMENDATIONS|$)/i);
    if (diseaseMatch && diseaseMatch[1]) {
      categories.diseaseDescription = diseaseMatch[1].trim();
    }

    // Extract drug recommendations (section 2)
    const drugMatch = response.match(/2\.?\s*DRUG RECOMMENDATIONS\s*([\s\S]*?)(?=3\.?\s*SIDE EFFECTS|$)/i);
    if (drugMatch && drugMatch[1]) {
      categories.drugRecommendations = drugMatch[1].trim();
    }

    // Extract side effects (section 3)
    const sideEffectsMatch = response.match(/3\.?\s*SIDE EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.?\s*CONTRAINDICATIONS|$)/i);
    if (sideEffectsMatch && sideEffectsMatch[1]) {
      categories.sideEffects = sideEffectsMatch[1].trim();
    }

    // Extract contraindications (section 4)
    const contraindicationsMatch = response.match(/4\.?\s*CONTRAINDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.?\s*HERBAL MEDICINE|$)/i);
    if (contraindicationsMatch && contraindicationsMatch[1]) {
      categories.contraindications = contraindicationsMatch[1].trim();
    }

    // Extract herbal alternatives (section 5)
    const herbalMatch = response.match(/5\.?\s*HERBAL MEDICINE[^\n]*\s*([\s\S]*?)(?=6\.?\s*FOOD-BASED|$)/i);
    if (herbalMatch && herbalMatch[1]) {
      categories.herbalAlternatives = herbalMatch[1].trim();
    }

    // Extract food-based treatments (section 6)
    const foodMatch = response.match(/6\.?\s*FOOD-BASED TREATMENTS\s*([\s\S]*?)(?=Disclaimer|$)/i);
    if (foodMatch && foodMatch[1]) {
      categories.foodBasedTreatments = foodMatch[1].trim();
    }

    return categories;
  } catch (error) {
    console.error("Error parsing Gemini response:", error);
    return categories;
  }
}

/**
 * Enhances the GeminiResponse with parsed categories
 */
export function enhanceGeminiResponse(response: GeminiResponse): GeminiResponse {
  if (!response.text) {
    return response;
  }
  
  // Parse the response text into structured categories
  const categories = parseGeminiResponse(response.text);
  
  // Return enhanced response with parsed categories
  return {
    ...response,
    categories
  };
}
