
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
      console.log("Extracting sections using numbered pattern");
      
      // Extract disease description section (section 1)
      const diseaseDescriptionMatch = text.match(/1\.?\s*(?:DISEASE\s*)?DESCRIPTION\s*([\s\S]*?)(?=2\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n\s*\d\.|\n\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (diseaseDescriptionMatch && diseaseDescriptionMatch[1]) {
        categories.diseaseDescription = diseaseDescriptionMatch[1].trim();
        console.log("Found disease description section of length:", categories.diseaseDescription.length);
      }
      
      // Extract drug recommendations section (section 2)
      const drugRecommendationsMatch = text.match(/2\.?\s*(?:DRUG\s*)?RECOMMENDATIONS\s*([\s\S]*?)(?=3\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (drugRecommendationsMatch && drugRecommendationsMatch[1]) {
        categories.drugRecommendations = drugRecommendationsMatch[1].trim();
        console.log("Found drug recommendations section of length:", categories.drugRecommendations.length);
      }
      
      // Extract side effects section (section 3)
      const sideEffectsMatch = text.match(/3\.?\s*(?:SIDE\s*)?EFFECTS[^\n]*\s*([\s\S]*?)(?=4\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (sideEffectsMatch && sideEffectsMatch[1]) {
        categories.sideEffects = sideEffectsMatch[1].trim();
        console.log("Found side effects section of length:", categories.sideEffects.length);
      }
      
      // Extract contraindications section (section 4)
      const contraindicationsMatch = text.match(/4\.?\s*(?:CONTRA)?INDICATIONS[^\n]*\s*([\s\S]*?)(?=5\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (contraindicationsMatch && contraindicationsMatch[1]) {
        categories.contraindications = contraindicationsMatch[1].trim();
        console.log("Found contraindications section of length:", categories.contraindications.length);
      }
      
      // Extract herbal alternatives section (section 5)
      const herbalAlternativesMatch = text.match(/5\.?\s*(?:HERBAL\s*)?[^\n]*?(?:ALTERNATIVES?|MEDICINE|REMEDIES)\s*([\s\S]*?)(?=6\.|\n\n\d\.|\n\s*\n\s*\d\.|\n\s*\n[A-Z]+|\n\s*\n[0-9]\.)/i);
      if (herbalAlternativesMatch && herbalAlternativesMatch[1]) {
        categories.herbalAlternatives = herbalAlternativesMatch[1].trim();
        console.log("Found herbal alternatives section of length:", categories.herbalAlternatives.length);
      }
      
      // Extract food-based treatments section (section 6)
      const foodBasedTreatmentsMatch = text.match(/6\.?\s*(?:FOOD[\s\-]*BASED)?\s*TREATMENTS?\s*([\s\S]*?)(?=Disclaimer|Medical\s*Disclaimer|$)/i);
      if (foodBasedTreatmentsMatch && foodBasedTreatmentsMatch[1]) {
        categories.foodBasedTreatments = foodBasedTreatmentsMatch[1].trim();
        console.log("Found food-based treatments section of length:", categories.foodBasedTreatments.length);
      }
    }
    
    // Function to extract sections based on headers (e.g., "DISEASE DESCRIPTION")
    function extractHeaderSections() {
      console.log("Trying to extract sections using header pattern");
      
      // Match header blocks with content following them
      const sectionHeaders = [
        { key: "diseaseDescription", patterns: ["DISEASE DESCRIPTION", "ABOUT THE CONDITION"] },
        { key: "drugRecommendations", patterns: ["DRUG RECOMMENDATIONS", "MEDICATIONS"] },
        { key: "sideEffects", patterns: ["SIDE EFFECTS", "ADVERSE EFFECTS"] },
        { key: "contraindications", patterns: ["CONTRAINDICATIONS", "INTERACTIONS"] },
        { key: "herbalAlternatives", patterns: ["HERBAL MEDICINE", "ALTERNATIVE MEDICINE"] },
        { key: "foodBasedTreatments", patterns: ["FOOD-BASED TREATMENTS", "DIETARY RECOMMENDATIONS"] }
      ];
      
      // Split the text into sections by double newlines
      const sections = text.split(/\n\s*\n/);
      
      // Try to match each section to a category
      sections.forEach(section => {
        const trimmedSection = section.trim();
        
        // Skip empty sections
        if (!trimmedSection) return;
        
        // Check if this section starts with or contains a header we recognize
        sectionHeaders.forEach(({ key, patterns }) => {
          // Skip if we already found this category
          if (categories[key]) return;
          
          // Check if section starts with or contains one of our header patterns
          if (patterns.some(pattern => trimmedSection.toUpperCase().includes(pattern))) {
            categories[key] = trimmedSection.replace(new RegExp(`.*?(${patterns.join('|')}).*?[\n:]`, 'i'), '').trim();
            console.log(`Found ${key} via header pattern with content length:`, categories[key].length);
          }
        });
      });
    }
    
    // Function to extract sections based on bullet points
    function extractBulletPoints() {
      console.log("Trying to extract content from bullet points");
      
      // If we have some plain bullet points but no clear sections
      const bulletPointGroups = text.split(/\n\s*\n/).filter(group => group.trim().startsWith('•'));
      
      if (bulletPointGroups.length > 0) {
        console.log(`Found ${bulletPointGroups.length} bullet point groups`);
        
        // Distribute bullet point groups to categories
        const categoryKeys = ["diseaseDescription", "drugRecommendations", "sideEffects", 
                             "contraindications", "herbalAlternatives", "foodBasedTreatments"];
        
        // Assign bullet point groups to categories if not already assigned
        bulletPointGroups.forEach((group, index) => {
          if (index < categoryKeys.length && !categories[categoryKeys[index]]) {
            categories[categoryKeys[index]] = group.trim();
            console.log(`Assigned bullet group to ${categoryKeys[index]}`);
          }
        });
      } else {
        // If no bullet point groups, try to find individual bullet points
        const bulletPoints = text.match(/•[^\n]+/g) || [];
        
        if (bulletPoints.length >= 6) {
          console.log(`Found ${bulletPoints.length} individual bullet points`);
          
          // Group bullet points into categories (about 1/6th of the bullets per category)
          const pointsPerCategory = Math.max(1, Math.ceil(bulletPoints.length / 6));
          
          if (!categories.diseaseDescription) {
            categories.diseaseDescription = bulletPoints.slice(0, pointsPerCategory).join('\n');
          }
          
          if (!categories.drugRecommendations) {
            categories.drugRecommendations = bulletPoints.slice(pointsPerCategory, pointsPerCategory * 2).join('\n');
          }
          
          if (!categories.sideEffects) {
            categories.sideEffects = bulletPoints.slice(pointsPerCategory * 2, pointsPerCategory * 3).join('\n');
          }
          
          if (!categories.contraindications) {
            categories.contraindications = bulletPoints.slice(pointsPerCategory * 3, pointsPerCategory * 4).join('\n');
          }
          
          if (!categories.herbalAlternatives) {
            categories.herbalAlternatives = bulletPoints.slice(pointsPerCategory * 4, pointsPerCategory * 5).join('\n');
          }
          
          if (!categories.foodBasedTreatments) {
            categories.foodBasedTreatments = bulletPoints.slice(pointsPerCategory * 5).join('\n');
          }
        }
      }
    }
    
    // Ensure all categories exist with reasonable default values when missing
    function ensureAllCategoriesExist() {
      console.log("Ensuring all categories exist");
      
      // If we have no categories at all, but have text, use it all as disease description
      if (Object.keys(categories).length === 0 && text.trim().length > 0) {
        categories.diseaseDescription = text.trim();
        console.log("No categories found, using all text as disease description");
      }
      
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
    console.warn("Using fallback categories due to parsing failure");
    
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
  const enhancedResponse: GeminiResponse = {
    ...response,
    categories: Object.keys(categories).length > 0 ? categories : undefined
  };
  
  console.log("Enhanced response created with categories:", Object.keys(enhancedResponse.categories || {}));
  return enhancedResponse;
};
