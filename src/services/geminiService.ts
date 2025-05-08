
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
  "epilepsy", "schizophrenia", "bipolar", "hepatitis", "cirrhosis",
  // Added more diseases to ensure they're recognized
  "cancer", "diabetes", "hypertension", "asthma", "arthritis",
  "pneumonia", "bronchitis", "influenza", "aids", "hiv",
  "sars", "covid", "coronavirus", "malaria", "tuberculosis",
  "depression", "anxiety", "adhd", "autism", "dementia"
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
 * Completely redesigned to never block valid medical queries
 */
export const generatePharmacyResponse = async (query: string): Promise<GeminiResponse> => {
  try {
    console.log(`Starting to process query: "${query}"`);
    
    // Track interaction for this query
    trackInteraction(query);
    
    // Normalize the query with medical synonyms
    const normalizedQuery = normalizeQuery(query);
    console.log(`Original query: "${query}" -> Normalized: "${normalizedQuery}"`);
    
    // Step 1: Fast path for known medical queries - bypass all checks
    // Check if query contains any common disease names - immediate acceptance
    const containsCommonDisease = commonDiseases.some(disease => 
      normalizedQuery.includes(disease)
    );
    
    if (containsCommonDisease) {
      console.log("Query contains a common disease name, skipping relevance checks");
    }
    
    // Step 2: Check for disease aliases in the query - another fast path
    const containsDiseaseName = Object.keys(diseaseAliasesMap).some(alias => 
      normalizedQuery.includes(alias.toLowerCase())
    );
    
    if (containsDiseaseName) {
      console.log("Query contains a disease alias, skipping relevance checks");
    }
    
    // Step 3: Use our local validator first as a quick check
    const localValidation = isValidMedicalQuery(normalizedQuery);
    console.log("Local relevance validation result:", localValidation);
    
    // Step 4: Combine initial checks
    let isRelevant = localValidation || containsCommonDisease || containsDiseaseName;
    
    // Step 5: Check for repeat attempts - users may be frustrated by blocks
    const interaction = interactionTracker[normalizedQuery];
    const allowDueToMultipleAttempts = interaction && interaction.count > 1;
    
    if (allowDueToMultipleAttempts) {
      console.log("User has tried this query multiple times, allowing through");
      isRelevant = true;
    }
    
    // Step 6: Only if the query hasn't been determined to be relevant, 
    // check with Gemini API as a more sophisticated check
    if (!isRelevant) {
      try {
        const apiRelevanceCheck = await checkMedicalRelevance(normalizedQuery);
        console.log("Gemini relevance check result:", apiRelevanceCheck);
        isRelevant = apiRelevanceCheck; // Use the API result
      } catch (error) {
        console.warn("Gemini relevance check failed, defaulting to accept:", error);
        // If the check fails, assume relevant to avoid blocking valid queries
        isRelevant = true;
      }
    }
    
    // Step 7: Make final decision on whether to process the query
    // ONLY reject if ALL checks have determined it's not medical
    // AND this is the first or second attempt
    if (!isRelevant && !allowDueToMultipleAttempts && 
        !localValidation && !containsDiseaseName && !containsCommonDisease) {
      console.log("All checks determined query is non-medical:", normalizedQuery);
      throw new Error(
        "PharmaHeal is a medical assistant. Please ask a question related to health, medication, or wellness."
      );
    }
    
    // Step 8: Query passed all checks (or checks were bypassed) - process it
    
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
    // Expanded to check for many disease types that should always work
    const queryLower = query.toLowerCase();
    if (commonDiseases.some(disease => queryLower.includes(disease)) || 
        Object.keys(diseaseAliasesMap).some(alias => queryLower.includes(alias.toLowerCase()))) {
        
      console.log("Providing detailed fallback response for disease query");
      
      // Extract the disease name for a better response
      let diseaseName = "the requested condition";
      
      // Try to extract disease name from the query
      for (const disease of commonDiseases) {
        if (queryLower.includes(disease)) {
          diseaseName = disease;
          break;
        }
      }
      
      // Check disease aliases too
      if (diseaseName === "the requested condition") {
        for (const alias of Object.keys(diseaseAliasesMap)) {
          if (queryLower.includes(alias.toLowerCase())) {
            diseaseName = alias;
            const standardName = diseaseAliasesMap[alias];
            if (standardName) {
              diseaseName = standardName;
            }
            break;
          }
        }
      }
      
      errorResponse.text = `
1. DISEASE DESCRIPTION
• ${diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1)} is a recognized medical condition
• Information about specific types, stages, and variations may vary
• This condition requires proper medical evaluation and diagnosis

2. DRUG RECOMMENDATIONS
• Treatment options should be determined by healthcare professionals
• Medications are typically prescribed based on specific diagnosis, severity, and patient factors
• Please consult with a qualified healthcare provider for personalized treatment recommendations

3. SIDE EFFECTS & INDICATIONS
• All medications have potential side effects that vary by individual
• Common side effects depend on the specific treatment prescribed
• Close monitoring during treatment is essential

4. CONTRAINDICATIONS & INTERACTIONS
• Many medications have specific contraindications
• Drug interactions are possible with various medications
• Always inform your healthcare provider about all medications you take

5. HERBAL MEDICINE ALTERNATIVES
• Some complementary treatments may be used alongside conventional medicine
• Evidence for alternative treatments varies significantly
• Discuss all alternative treatments with your healthcare provider

6. FOOD-BASED TREATMENTS
• Dietary changes may help manage symptoms or support treatment
• Specific nutritional needs should be discussed with healthcare providers
• A balanced diet is generally recommended during treatment

Medical Disclaimer: This fallback information is not a substitute for professional medical advice. Please consult qualified healthcare professionals for diagnosis and treatment.`;
      
      // Create basic categories for the fallback response
      errorResponse.categories = {
        diseaseDescription: `• ${diseaseName.charAt(0).toUpperCase() + diseaseName.slice(1)} is a recognized medical condition\n• Information about specific types, stages, and variations may vary\n• This condition requires proper medical evaluation and diagnosis`,
        drugRecommendations: "• Treatment options should be determined by healthcare professionals\n• Medications are typically prescribed based on specific diagnosis, severity, and patient factors\n• Please consult with a qualified healthcare provider for personalized treatment recommendations",
        sideEffects: "• All medications have potential side effects that vary by individual\n• Common side effects depend on the specific treatment prescribed\n• Close monitoring during treatment is essential",
        contraindications: "• Many medications have specific contraindications\n• Drug interactions are possible with various medications\n• Always inform your healthcare provider about all medications you take",
        herbalAlternatives: "• Some complementary treatments may be used alongside conventional medicine\n• Evidence for alternative treatments varies significantly\n• Discuss all alternative treatments with your healthcare provider",
        foodBasedTreatments: "• Dietary changes may help manage symptoms or support treatment\n• Specific nutritional needs should be discussed with healthcare providers\n• A balanced diet is generally recommended during treatment"
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
