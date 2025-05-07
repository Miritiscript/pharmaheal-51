
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
  "cv": "cardiovascular"
};

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
    // Track interaction for this query
    trackInteraction(query);
    
    // Normalize the query with medical synonyms
    const normalizedQuery = normalizeQuery(query);
    console.log(`Original query: "${query}" -> Normalized: "${normalizedQuery}"`);
    
    // For suggested prompts or common medical terms, bypass relevance check
    if (isSuggestedPrompt(query) || containsCommonMedicalTerms(query)) {
      console.log("Bypassing relevance check for common medical query:", query);
      const isRelevant = true;
      
      // Continue with query processing using the bypass path
      return processValidQuery(query, normalizedQuery, isRelevant);
    }
    
    // Check relevance using Gemini API
    console.log("Checking query relevance with Gemini API:", normalizedQuery);
    const isRelevant = await checkMedicalRelevance(normalizedQuery);
    console.log("Gemini relevance check result:", isRelevant);
    
    if (!isRelevant) {
      // Even if Gemini says query isn't relevant, check if it's been rejected multiple times
      const interaction = interactionTracker[normalizedQuery];
      if (interaction && interaction.count > 2) {
        // If user has tried multiple times with same query, allow it to pass through
        console.log(`Allowing previously rejected query after multiple attempts: ${query}`);
        return processValidQuery(query, normalizedQuery, false);
      } else {
        // Also do a backup check with our local validator as a safety net
        const localValidation = isValidMedicalQuery(normalizedQuery);
        console.log("Local relevance validation result:", localValidation);
        
        if (localValidation) {
          console.log("Local validator overrode Gemini rejection:", normalizedQuery);
          // Continue processing even though Gemini said no
          return processValidQuery(query, normalizedQuery, true);
        } else {
          console.log("Query rejected by both validators:", normalizedQuery);
          throw new Error(
            "PharmaHeal is a medical assistant. Please ask a question related to health, medication, or wellness."
          );
        }
      }
    }
    
    // Process the valid query
    return processValidQuery(query, normalizedQuery, isRelevant);
    
  } catch (error) {
    console.error("Error generating pharmacy response:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("An unexpected error occurred while processing your request.");
    }
  }
};

/**
 * Process a query that has been validated as medically relevant
 */
async function processValidQuery(query: string, normalizedQuery: string, isRelevant: boolean): Promise<GeminiResponse> {
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
  
  // Get AI-generated content using the enhanced and expanded query
  console.log(`Processing medical query: ${expandedQuery}`);
  
  try {
    const response = await generateGeminiContent(expandedQuery);
    
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
    return enhancedResponse;
  } catch (error) {
    console.error("Error generating Gemini content:", error);
    throw new Error("There was an error generating medical content. Please try again or rephrase your query.");
  }
}

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

/**
 * Check if a query matches one of our suggested prompts
 */
function isSuggestedPrompt(query: string): boolean {
  const suggestedPrompts = [
    "what are the side effects of ibuprofen",
    "best treatments for migraine",
    "drug interactions with warfarin",
    "herbal remedies for anxiety",
    "foods to avoid with high blood pressure",
  ];

  const normalizedQuery = query.toLowerCase().replace(/[?.,!]/g, '').trim();
  
  for (const prompt of suggestedPrompts) {
    if (normalizedQuery.includes(prompt.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if a query contains common medical terms
 */
function containsCommonMedicalTerms(query: string): boolean {
  const commonTerms = [
    "medication", "drug", "medicine", "treatment", "symptom", "disease", 
    "condition", "side effect", "interaction", "dosage", "prescription", 
    "migraine", "headache", "pain", "blood pressure", "diabetes", "hypertension",
    "covid", "cancer", "heart", "liver", "kidney", "lung", "brain", "chronic",
    "acute", "therapy", "diagnosis", "prognosis", "contraindication", "allergy", 
    "reaction", "overdose", "withdrawal", "herbal", "supplement", "vitamin"
  ];

  const normalizedQuery = query.toLowerCase();
  
  for (const term of commonTerms) {
    if (normalizedQuery.includes(term)) {
      return true;
    }
  }
  
  return false;
}
