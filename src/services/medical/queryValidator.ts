
import { medicalTerms, medicalKeywords } from './medicalTerms';
import { diseaseAliasesMap, medicalSpecialties, medicalSymptoms } from './diseaseAliases';

// Combined list of all medical terms for validation
const allMedicalTerms = [
  ...Object.keys(diseaseAliasesMap),
  ...Object.values(diseaseAliasesMap),
  ...medicalTerms,
  ...medicalKeywords,
  ...medicalSpecialties,
  ...medicalSymptoms
];

// Define common patterns for health-related questions
const healthQuestionPatterns = [
  /what (is|are) (the|a) (treatment|medication|remedy|cure|symptom|cause|effect|side effect|risk|complication|dosage|interaction)/i,
  /how (to|do I|can I|should I) (treat|manage|handle|deal with|cope with|relieve|reduce|prevent)/i,
  /can you (tell me about|explain|describe|list) (symptoms|treatments|medications|causes|effects|risks|complications|interactions)/i,
  /(is|are) there (any|alternative|natural|herbal|better) (treatment|medication|remedy|cure|therapy|option)/i,
  /should I (take|use|try|avoid|stop|increase|decrease|continue)/i,
  /(what|when|how|why) (should|would|could|do|does) (a|the) (doctor|medication|treatment|therapy|procedure)/i,
  /(help|advice|information) (with|for|about|on|regarding) (my|this|these|that|those)/i,
  /(difference|distinguish|compare) between/i,
  /alternatives to/i,
  /natural (remedy|treatment|solution|approach|alternative)/i,
  /home (remedy|treatment|solution|approach)/i,
  /side effects/i,
  /drug interaction/i,
  /dosage/i,
  /safe (to|for)/i
];

/**
 * Validates if a query is medical-related by checking for medical terms and patterns
 */
export const isValidMedicalQuery = (query: string): boolean => {
  // Default to accepting the query
  if (!query || query.trim().length < 2) {
    return false;
  }

  const normalizedQuery = query.toLowerCase().trim();
  
  // Accept all queries with at least 3 words, assuming they are valid
  if (normalizedQuery.split(/\s+/).length >= 3) {
    return true;
  }

  // Check if the query contains any medical term
  for (const term of allMedicalTerms) {
    if (normalizedQuery.includes(term.toLowerCase())) {
      console.log(`Medical term found in query: ${term}`);
      return true;
    }
  }

  // Check if the query matches any health question pattern
  for (const pattern of healthQuestionPatterns) {
    if (pattern.test(normalizedQuery)) {
      console.log(`Health question pattern matched: ${pattern}`);
      return true;
    }
  }

  // Check for single word medical terms
  const queryWords = normalizedQuery.split(/\s+/);
  for (const word of queryWords) {
    if (allMedicalTerms.some(term => term.toLowerCase() === word)) {
      console.log(`Single word medical term found: ${word}`);
      return true;
    }
  }

  // Default to accepting queries to avoid false negatives
  if (normalizedQuery.length > 10) {
    console.log('Query accepted based on length (> 10 characters)');
    return true;
  }

  console.log('Query rejected: not identified as medical-related');
  return false;
};

/**
 * Standardizes a medical term by looking up its formal name
 */
export const standardizeMedicalTerm = (term: string): string => {
  const normalizedTerm = term.toLowerCase().trim();
  return diseaseAliasesMap[normalizedTerm] || term;
};

/**
 * Expands a query by adding related medical terms
 */
export const expandMedicalQuery = (query: string): string => {
  let expandedQuery = query;
  
  // Check for disease aliases and add the standardized term
  const words = query.toLowerCase().split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (diseaseAliasesMap[word]) {
      expandedQuery += ` ${diseaseAliasesMap[word]}`;
    }
    
    // Check for two-word combinations
    if (i < words.length - 1) {
      const twoWords = `${word} ${words[i+1]}`;
      if (diseaseAliasesMap[twoWords]) {
        expandedQuery += ` ${diseaseAliasesMap[twoWords]}`;
      }
    }
    
    // Check for three-word combinations
    if (i < words.length - 2) {
      const threeWords = `${word} ${words[i+1]} ${words[i+2]}`;
      if (diseaseAliasesMap[threeWords]) {
        expandedQuery += ` ${diseaseAliasesMap[threeWords]}`;
      }
    }
  }
  
  return expandedQuery;
};
