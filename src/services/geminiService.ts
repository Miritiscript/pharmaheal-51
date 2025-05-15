
import { generateGeminiContent, checkMedicalRelevance } from './medical/geminiClient';
import { isValidMedicalQuery, expandMedicalQuery, standardizeMedicalTerm } from './medical/queryValidator';
import { diseaseAliasesMap } from './medical/diseaseAliases';
import { enhanceGeminiResponse } from './medical/responseParser';

// Define GeminiResponse type
export interface GeminiResponse {
  text: string;
  query: string;
  enhancedQuery: string;
  timestamp: Date;
  medicalTermsDetected?: Array<{
    colloquial: string;
    standard: string;
  }>;
  categories?: {
    diseaseDescription?: string;
    drugRecommendations?: string;
    sideEffects?: string;
    contraindications?: string;
    herbalAlternatives?: string;
    foodBasedTreatments?: string;
  };
  isRelevant?: boolean;
  error?: string;
}

// Medical abbreviation synonyms for preprocessing
const medicalSynonyms: Record<string, string> = {
  "bp": "blood pressure",
  "htn": "hypertension",
  "dm": "diabetes mellitus",
  "diab": "diabetes",
  "meds": "medications",
  "rx": "prescription",
  "prn": "as needed",
  "otc": "over the counter",
  "gi": "gastrointestinal",
  "cv": "cardiovascular",
  // Added more common medical abbreviations
  "afib": "atrial fibrillation",
  "ca": "cancer",
  "cad": "coronary artery disease",
  "chf": "congestive heart failure",
  "copd": "chronic obstructive pulmonary disease",
  "dvt": "deep vein thrombosis",
  "mi": "myocardial infarction",
  "ra": "rheumatoid arthritis",
  "uti": "urinary tract infection",
  "tb": "tuberculosis"
};

// Common disease names to ensure they're recognized
const commonDiseases = [
  "leukemia", "lymphoma", "melanoma", "alzheimer", "parkinson", 
  "crohn", "lupus", "fibromyalgia", "multiple sclerosis", "ms",
  "epilepsy", "schizophrenia", "bipolar", "hepatitis", "cirrhosis"
];

// Function to normalize query with medical synonyms
function normalizeQuery(query: string): string {
  let normalized = query.toLowerCase().trim();
  
  for (const abbr in medicalSynonyms) {
    normalized = normalized.replace(new RegExp(`\\b${abbr}\\b`, 'gi'), medicalSynonyms[abbr]);
  }
  
  return normalized;
}

// Dictionary to track interaction info
const interactionTracker: Record<string, { count: number; lastRejectedAt?: Date }> = {};

/**
 * Processes a pharmacy-related query and returns AI-generated information
 */
export const generatePharmacyResponse = async (query: string): Promise<GeminiResponse> => {
  try {
    console.log(`Starting to process query: "${query}"`);
    
    // Track interaction for this query
    trackInteraction(query);
    
    // Normalize the query with medical synonyms
    const normalizedQuery = normalizeQuery(query);
    console.log(`Original query: "${query}" -> Normalized: "${normalizedQuery}"`);
    
    // Check if query contains any common disease names - immediate acceptance
    const containsCommonDisease = commonDiseases.some(disease => 
      normalizedQuery.includes(disease)
    );
    
    if (containsCommonDisease) {
      console.log("Query contains a common disease name, accepting as medically relevant");
    }
    
    // Use our local validator first as a safety check
    const localValidation = isValidMedicalQuery(normalizedQuery);
    console.log("Local relevance validation result:", localValidation);
    
    let isRelevant = localValidation || containsCommonDisease; // Accept if either check passes
    
    // Then verify with Gemini API for more accurate checking if needed
    if (!isRelevant) {
      try {
        isRelevant = await checkMedicalRelevance(normalizedQuery);
        console.log("Gemini relevance check result:", isRelevant);
      } catch (error) {
        // If Gemini API fails, fall back to local validation result
        console.warn("Gemini relevance check failed, using local validation:", error);
        isRelevant = true; // Default to accepting if the check fails
      }
    }
    
    // Always allow disease names through regardless of relevance checks
    const isDiseaseQuery = query.toLowerCase().split(/\s+/).some(word => {
      return Object.keys(diseaseAliasesMap).some(alias => 
        alias.toLowerCase() === word.toLowerCase()
      );
    });
    
    if (isDiseaseQuery) {
      console.log("Query contains disease name, overriding relevance check");
      isRelevant = true;
    }
    
    // Allow through if:
    // 1. The query is deemed relevant
    // 2. OR the user has tried multiple times with the same query
    const interaction = interactionTracker[normalizedQuery];
    const allowDueToMultipleAttempts = interaction && interaction.count > 2;
    
    // Accept almost everything for improved user experience, reject only obvious non-medical queries
    if (!isRelevant && !allowDueToMultipleAttempts && !localValidation && !isDiseaseQuery && !containsCommonDisease) {
      console.log("Query rejected as non-medical:", normalizedQuery);
      throw new Error(
        "PharmaHeal is a medical assistant. Please ask a question related to health, medication, or wellness."
      );
    }
    
    // Enhance the query with standard medical terms
    let enhancedQuery = normalizedQuery;
    
    // Check if any words in the query match disease aliases and enhance with standard terms
    Object.keys(diseaseAliasesMap).forEach(alias => {
      if (normalizedQuery.includes(alias.toLowerCase())) {
        const standardTerm = diseaseAliasesMap[alias];
        if (!normalizedQuery.includes(standardTerm.toLowerCase())) {
          enhancedQuery += ` (${standardTerm})`;
        }
      }
    });
    
    // Further expand the query with related medical terms
    const expandedQuery = expandMedicalQuery(enhancedQuery);
    console.log(`Processing medical query: ${expandedQuery}`);
    
    // Get AI-generated content using the enhanced and expanded query
    const response = await generateGeminiContent(expandedQuery);
    
    console.log("Received Gemini response of length:", response.text.length);
    
    // Build the initial response
    const initialResponse: GeminiResponse = {
      text: response.text,
      query: query,
      enhancedQuery: enhancedQuery,
      timestamp: new Date(),
      isRelevant: isRelevant,
      // Extract key medical terms that matched in the query
      medicalTermsDetected: Object.keys(diseaseAliasesMap).filter(term => 
        normalizedQuery.includes(term.toLowerCase())
      ).map(term => ({
        colloquial: term,
        standard: diseaseAliasesMap[term]
      }))
    };
    
    // Enhance the response with parsed categories
    const enhancedResponse = enhanceGeminiResponse(initialResponse);
    console.log("Enhanced response with categories:", Object.keys(enhancedResponse.categories || {}));
    return enhancedResponse;
  } catch (error) {
    console.error("Error generating pharmacy response:", error);
    
    // Create an error response
    const errorResponse: GeminiResponse = {
      text: error instanceof Error ? error.message : "An unexpected error occurred",
      query: query,
      enhancedQuery: query,
      timestamp: new Date(),
      isRelevant: false,
      error: error instanceof Error ? error.message : "Unknown error"
    };
    
    // For specific disease queries that are failing, provide a default structured response
    if (query.toLowerCase().includes("leukemia") || 
        query.toLowerCase().includes("cancer") || 
        commonDiseases.some(disease => query.toLowerCase().includes(disease))) {
        
      console.log("Providing fallback response for disease query");
      errorResponse.text = `
1. DISEASE DESCRIPTION
• The requested disease information could not be retrieved from the API
• Please try again later or try a different phrasing
• This is a known disease that should be supported

2. DRUG RECOMMENDATIONS
• Please consult with a healthcare professional for appropriate treatments
• Treatment options vary based on type, stage, and individual factors
• Error occurred: API communication issue

3. SIDE EFFECTS & INDICATIONS
• Medication side effects depend on specific treatments prescribed
• Please consult a healthcare provider for personalized information
• Common treatments may include various classes of medications

4. CONTRAINDICATIONS & INTERACTIONS
• Many treatments have specific contraindications
• Drug interactions are possible with various medications
• Always inform your healthcare provider about all medications you take

5. HERBAL MEDICINE ALTERNATIVES
• Scientific evidence for herbal treatments may be limited
• Always consult healthcare providers before trying alternative treatments
• Do not replace conventional treatments with alternatives without medical guidance

6. FOOD-BASED TREATMENTS
• No scientifically-backed food-based treatments found for this condition

Medical Disclaimer: This information is not a substitute for professional medical advice. Please consult healthcare professionals.`;
      
      // Create basic categories for the fallback response
      errorResponse.categories = {
        diseaseDescription: "• The requested disease information could not be retrieved from the API\n• Please try again later or try a different phrasing\n• This is a known disease that should be supported",
        drugRecommendations: "• Please consult with a healthcare professional for appropriate treatments\n• Treatment options vary based on type, stage, and individual factors\n• Error occurred: API communication issue",
        sideEffects: "• Medication side effects depend on specific treatments prescribed\n• Please consult a healthcare provider for personalized information\n• Common treatments may include various classes of medications",
        contraindications: "• Many treatments have specific contraindications\n• Drug interactions are possible with various medications\n• Always inform your healthcare provider about all medications you take",
        herbalAlternatives: "• Scientific evidence for herbal treatments may be limited\n• Always consult healthcare providers before trying alternative treatments\n• Do not replace conventional treatments with alternatives without medical guidance",
        foodBasedTreatments: "• No scientifically-backed food-based treatments found for this condition"
      };
      
      return errorResponse;
    }
    
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while processing your request.");
    }
  }
};

/**
 * Tracks interaction data for a query to improve response handling
 */
function trackInteraction(query: string) {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!interactionTracker[normalizedQuery]) {
    interactionTracker[normalizedQuery] = {
      count: 1
    };
  } else {
    interactionTracker[normalizedQuery].count++;
  }
  
  // Clean up old interactions to prevent memory leaks
  // Keep only the 100 most recent interactions
  const queries = Object.keys(interactionTracker);
  if (queries.length > 100) {
    // Delete the oldest interactions
    const oldestQueries = queries
      .sort((a, b) => {
        const dateA = interactionTracker[a].lastRejectedAt?.getTime() || 0;
        const dateB = interactionTracker[b].lastRejectedAt?.getTime() || 0;
        return dateA - dateB;
      })
      .slice(0, queries.length - 100);
      
    oldestQueries.forEach(q => delete interactionTracker[q]);
  }
}
