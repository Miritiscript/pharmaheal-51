
import { GeminiResponse } from '../geminiService';

/**
 * Parses and enhances the raw Gemini response to extract structured medical information
 */
export const enhanceGeminiResponse = (response: GeminiResponse): GeminiResponse => {
  const { text } = response;
  
  if (!text) {
    console.warn("Empty text response from Gemini");
    return response;
  }
  
  console.log("Enhancing response with categories parser");
  
  // Initialize categories object
  const categories: GeminiResponse['categories'] = {};
  
  // Try to extract sections using numbered headings
  try {
    // Extract disease description section (section 1)
    const diseaseDescriptionMatch = text.match(/1\.?\s*DISEASE DESCRIPTION\s*([\s\S]*?)(?=2\.?\s*DRUG RECOMMENDATIONS|$)/i);
    if (diseaseDescriptionMatch && diseaseDescriptionMatch[1]) {
      categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
    }
    
    // Extract drug recommendations section (section 2)
    const drugRecommendationsMatch = text.match(/2\.?\s*DRUG RECOMMENDATIONS\s*([\s\S]*?)(?=3\.?\s*SIDE EFFECTS|$)/i);
    if (drugRecommendationsMatch && drugRecommendationsMatch[1]) {
      categories.drugRecommendations = drugRecommendationsMatch[1].trim();
    }
    
    // Extract side effects section (section 3)
    const sideEffectsMatch = text.match(/3\.?\s*SIDE EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.?\s*CONTRAINDICATIONS|$)/i);
    if (sideEffectsMatch && sideEffectsMatch[1]) {
      categories.sideEffects = sideEffectsMatch[1].trim();
    }
    
    // Extract contraindications section (section 4)
    const contraindicationsMatch = text.match(/4\.?\s*CONTRAINDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.?\s*HERBAL|$)/i);
    if (contraindicationsMatch && contraindicationsMatch[1]) {
      categories.contraindications = contraindicationsMatch[1].trim();
    }
    
    // Extract herbal alternatives section (section 5)
    const herbalAlternativesMatch = text.match(/5\.?\s*HERBAL[^\n]*\s*([\s\S]*?)(?=6\.?\s*FOOD-BASED|$)/i);
    if (herbalAlternativesMatch && herbalAlternativesMatch[1]) {
      categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
    }
    
    // Extract food-based treatments section (section 6)
    const foodBasedTreatmentsMatch = text.match(/6\.?\s*FOOD-BASED TREATMENTS\s*([\s\S]*?)(?=Disclaimer|Medical Disclaimer|$)/i);
    if (foodBasedTreatmentsMatch && foodBasedTreatmentsMatch[1]) {
      categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
    }
    
    // If we didn't find any categories, try a simpler approach with just bullet points
    const extractedCategories = Object.keys(categories).length;
    console.log(`Extracted ${extractedCategories} categories from response`);
    
    if (extractedCategories === 0) {
      // Fallback: Try to extract any bulleted lists that might be present
      const bulletListRegex = /•\s*(.*?)(?=•|\n\n|$)/gs;
      const bulletMatches = [...text.matchAll(bulletListRegex)];
      
      if (bulletMatches.length > 0) {
        // If there are bullet points but no sections, consider it a disease description
        const bulletedContent = bulletMatches.map(match => `• ${match[1].trim()}`).join('\n');
        categories.diseaseDescription = bulletedContent;
        console.log("Created fallback disease description from bullets");
      }
    }
  } catch (error) {
    console.error("Error parsing response categories:", error);
  }
  
  // Create enhanced response with parsed categories
  return {
    ...response,
    categories: Object.keys(categories).length > 0 ? categories : undefined
  };
};
