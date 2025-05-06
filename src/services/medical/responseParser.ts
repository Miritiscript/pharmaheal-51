
import { GeminiResponse } from '../geminiService';

/**
 * Parses and enhances the raw Gemini response to extract structured medical information
 */
export const enhanceGeminiResponse = (response: GeminiResponse): GeminiResponse => {
  const { text } = response;
  
  if (!text) {
    return response;
  }
  
  // Initialize categories object
  const categories: GeminiResponse['categories'] = {};
  
  // Extract disease description section
  const diseaseDescriptionMatch = text.match(/1\.\s*DISEASE DESCRIPTION\s*([\s\S]*?)(?=2\.\s*DRUG RECOMMENDATIONS|$)/i);
  if (diseaseDescriptionMatch && diseaseDescriptionMatch[1]) {
    categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
  }
  
  // Extract drug recommendations section
  const drugRecommendationsMatch = text.match(/2\.\s*DRUG RECOMMENDATIONS\s*([\s\S]*?)(?=3\.\s*SIDE EFFECTS|$)/i);
  if (drugRecommendationsMatch && drugRecommendationsMatch[1]) {
    categories.drugRecommendations = drugRecommendationsMatch[1].trim();
  }
  
  // Extract side effects section
  const sideEffectsMatch = text.match(/3\.\s*SIDE EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.\s*CONTRAINDICATIONS|$)/i);
  if (sideEffectsMatch && sideEffectsMatch[1]) {
    categories.sideEffects = sideEffectsMatch[1].trim();
  }
  
  // Extract contraindications section
  const contraindicationsMatch = text.match(/4\.\s*CONTRAINDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.\s*HERBAL|$)/i);
  if (contraindicationsMatch && contraindicationsMatch[1]) {
    categories.contraindications = contraindicationsMatch[1].trim();
  }
  
  // Extract herbal alternatives section
  const herbalAlternativesMatch = text.match(/5\.\s*HERBAL[^\n]*\s*([\s\S]*?)(?=6\.\s*FOOD-BASED|$)/i);
  if (herbalAlternativesMatch && herbalAlternativesMatch[1]) {
    categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
  }
  
  // Extract food-based treatments section
  const foodBasedTreatmentsMatch = text.match(/6\.\s*FOOD-BASED TREATMENTS\s*([\s\S]*?)(?=Disclaimer|$)/i);
  if (foodBasedTreatmentsMatch && foodBasedTreatmentsMatch[1]) {
    categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
  }
  
  // Create enhanced response with parsed categories
  return {
    ...response,
    categories
  };
};
