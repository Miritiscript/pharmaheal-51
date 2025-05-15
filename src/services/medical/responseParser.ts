
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
  
  // Try to extract sections using different patterns - more resilient parsing
  try {
    // Try numbered section extraction first (most common format)
    extractNumberedSections();
    
    // If that didn't work well, try header-based extraction
    if (Object.keys(categories).length < 4) {
      extractHeaderSections();
    }
    
    // If we still don't have good results, try bullet point extraction as last resort
    if (Object.keys(categories).length < 4) {
      extractBulletPoints();
    }
    
    // Create reasonable defaults for any missing categories
    ensureAllCategoriesExist();
    
    console.log(`Final extraction result: ${Object.keys(categories).length} categories`);
    
    // Function to extract sections based on numbered headings (e.g., "1. DISEASE DESCRIPTION")
    function extractNumberedSections() {
      // Extract disease description section (section 1)
      const diseaseDescriptionMatch = text.match(/1\.?\s*(?:DISEASE\s*)?DESCRIPTION\s*([\s\S]*?)(?=2\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n\s*\d\.|\n\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (diseaseDescriptionMatch && diseaseDescriptionMatch[1]) {
        categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
      }
      
      // Extract drug recommendations section (section 2)
      const drugRecommendationsMatch = text.match(/2\.?\s*(?:DRUG\s*)?RECOMMENDATIONS\s*([\s\S]*?)(?=3\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (drugRecommendationsMatch && drugRecommendationsMatch[1]) {
        categories.drugRecommendations = drugRecommendationsMatch[1].trim();
      }
      
      // Extract side effects section (section 3)
      const sideEffectsMatch = text.match(/3\.?\s*(?:SIDE\s*)?EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (sideEffectsMatch && sideEffectsMatch[1]) {
        categories.sideEffects = sideEffectsMatch[1].trim();
      }
      
      // Extract contraindications section (section 4)
      const contraindicationsMatch = text.match(/4\.?\s*(?:CONTRA)?INDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (contraindicationsMatch && contraindicationsMatch[1]) {
        categories.contraindications = contraindicationsMatch[1].trim();
      }
      
      // Extract herbal alternatives section (section 5)
      const herbalAlternativesMatch = text.match(/5\.?\s*(?:HERBAL\s*)?[^\n]*?(?:ALTERNATIVES?|MEDICINE|REMEDIES)\s*([\s\S]*?)(?=6\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (herbalAlternativesMatch && herbalAlternativesMatch[1]) {
        categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
      }
      
      // Extract food-based treatments section (section 6)
      const foodBasedTreatmentsMatch = text.match(/6\.?\s*(?:FOOD[\s\-]*BASED)?\s*TREATMENTS?\s*([\s\S]*?)(?=Disclaimer|Medical\s*Disclaimer|$)/i);
      if (foodBasedTreatmentsMatch && foodBasedTreatmentsMatch[1]) {
        categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
      }
    }
    
    // Function to extract sections based on headers (e.g., "DISEASE DESCRIPTION")
    function extractHeaderSections() {
      // Match header blocks with content following them
      const headerBlockPattern = /(DISEASE DESCRIPTION|DRUG RECOMMENDATIONS|SIDE EFFECTS|CONTRAINDICATIONS|HERBAL|FOOD-BASED)/gi;
      const headerMatches = [...text.matchAll(headerBlockPattern)];
      
      if (headerMatches.length > 0) {
        headerMatches.forEach((match, index) => {
          const header = match[0].toUpperCase();
          const startPos = match.index! + match[0].length;
          const endPos = index < headerMatches.length - 1 ? headerMatches[index+1].index! : text.length;
          let content = text.substring(startPos, endPos).trim();
          
          if (header.includes('DISEASE')) {
            categories.diseaseDescription = content;
          } else if (header.includes('DRUG')) {
            categories.drugRecommendations = content;
          } else if (header.includes('SIDE')) {
            categories.sideEffects = content;
          } else if (header.includes('CONTRA')) {
            categories.contraindications = content;
          } else if (header.includes('HERBAL')) {
            categories.herbalAlternatives = content;
          } else if (header.includes('FOOD')) {
            categories.foodBasedTreatments = content;
          }
        });
      }
    }
    
    // Function to extract sections based on bullet points
    function extractBulletPoints() {
      // If we have some plain bullet points but no clear sections
      const bulletListRegex = /^(?:•|\*)\s*(.*?)$/gm;
      const bulletMatches = [...text.matchAll(bulletListRegex)];
      
      if (bulletMatches.length > 0 && !categories.diseaseDescription) {
        // Group bullet points in reasonable chunks
        const totalBullets = bulletMatches.length;
        const bulletsPerCategory = Math.ceil(totalBullets / 6); // 6 categories
        let bulletGroups = [];
        
        for (let i = 0; i < totalBullets; i += bulletsPerCategory) {
          const endIndex = Math.min(i + bulletsPerCategory, totalBullets);
          const groupBullets = bulletMatches.slice(i, endIndex)
            .map(match => `• ${match[1].trim()}`)
            .join('\n');
          bulletGroups.push(groupBullets);
        }
        
        // Assign each group to a category
        if (bulletGroups.length > 0) categories.diseaseDescription = bulletGroups[0];
        if (bulletGroups.length > 1) categories.drugRecommendations = bulletGroups[1];
        if (bulletGroups.length > 2) categories.sideEffects = bulletGroups[2];
        if (bulletGroups.length > 3) categories.contraindications = bulletGroups[3];
        if (bulletGroups.length > 4) categories.herbalAlternatives = bulletGroups[4];
        if (bulletGroups.length > 5) categories.foodBasedTreatments = bulletGroups[5];
      }
    }
    
    // Ensure all categories exist with reasonable default values when missing
    function ensureAllCategoriesExist() {
      if (!categories.diseaseDescription) {
        categories.diseaseDescription = "• General information about this condition not available\n• Please consult a healthcare professional for specific details";
      }
      
      if (!categories.drugRecommendations) {
        categories.drugRecommendations = "• Medication information not available for this condition\n• Please consult with a healthcare professional for treatment options";
      }
      
      if (!categories.sideEffects) {
        categories.sideEffects = "• Side effect information not available\n• All medications may have side effects\n• Consult a healthcare provider for specific information";
      }
      
      if (!categories.contraindications) {
        categories.contraindications = "• Contraindication information not available\n• Always inform your doctor about all medications you take\n• Consult a healthcare provider before starting any treatment";
      }
      
      if (!categories.herbalAlternatives) {
        categories.herbalAlternatives = "• Herbal alternative information not available\n• Always consult with a healthcare provider before using herbal supplements";
      }
      
      if (!categories.foodBasedTreatments) {
        categories.foodBasedTreatments = "• No scientifically-backed food-based treatments found for this condition";
      }
    }
    
  } catch (error) {
    console.error("Error parsing response categories:", error);
    // Provide fallback categories
    provideFallbackCategories();
  }
  
  function provideFallbackCategories() {
    // If parsing failed completely, create simple default categories
    categories.diseaseDescription = "• Information about this condition could not be properly categorized\n• Please see below for all available information";
    categories.drugRecommendations = "• Please consult with a healthcare professional for treatment options";
    categories.sideEffects = "• Information not available in structured format";
    categories.contraindications = "• Information not available in structured format";
    categories.herbalAlternatives = "• Information not available in structured format";
    categories.foodBasedTreatments = "• No scientifically-backed food-based treatments found for this condition";
    
    // Add the full text as disease description if we have it
    if (text) {
      categories.diseaseDescription = text;
    }
  }
  
  // Create enhanced response with parsed categories
  return {
    ...response,
    categories: Object.keys(categories).length > 0 ? categories : undefined
  };
};
