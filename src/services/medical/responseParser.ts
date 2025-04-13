
import { GeminiResponse } from '../geminiService';

export const parseCategories = (text: string): GeminiResponse["categories"] => {
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
