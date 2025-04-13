
import { MEDICAL_KEYWORDS, MEDICAL_TERMINOLOGY_EXTENDED } from './medicalTerms';
import { DISEASE_ALIAS_MAP, MEDICAL_SYMPTOMS, MEDICAL_SPECIALTIES } from './diseaseAliases';
import { NON_MEDICAL_TOPICS } from './medicalTerms';
import { commonDiseases } from '@/data/diseasesList';

export const normalizeQuery = (query: string): string => {
  return query.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
};

export const containsMedicalTerminology = (query: string): boolean => {
  // Default assumption: treat as medical query
  if (!query.trim()) {
    return true;
  }
  
  const normalizedQuery = normalizeQuery(query);
  const queryWords = normalizedQuery.split(' ');
  
  // Check if the query matches ANY word in our medical databases
  // This is much more permissive than before

  // Check all medical keywords
  if (MEDICAL_KEYWORDS.some(term => normalizedQuery.includes(term.toLowerCase()))) {
    return true;
  }
  
  // Check extended medical terminology
  if (MEDICAL_TERMINOLOGY_EXTENDED.some(term => normalizedQuery.includes(term.toLowerCase()))) {
    return true;
  }
  
  // Check symptoms
  if (MEDICAL_SYMPTOMS.some(symptom => normalizedQuery.includes(symptom.toLowerCase()))) {
    return true;
  }
  
  // Check medical specialties
  if (MEDICAL_SPECIALTIES.some(specialty => normalizedQuery.includes(specialty.toLowerCase()))) {
    return true;
  }
  
  // Check against disease list
  if (commonDiseases.some(disease => normalizedQuery.includes(disease.toLowerCase()))) {
    return true;
  }
  
  // Check individual words against all our databases
  for (const word of queryWords) {
    if (word.length < 2) continue; // Skip very short words
    
    // Check if any individual word appears in our medical keyword lists
    if (MEDICAL_KEYWORDS.some(term => term.toLowerCase() === word)) {
      return true;
    }
    
    if (MEDICAL_TERMINOLOGY_EXTENDED.some(term => term.toLowerCase() === word)) {
      return true;
    }
    
    if (MEDICAL_SYMPTOMS.some(symptom => symptom.toLowerCase() === word)) {
      return true;
    }
    
    // Check if word appears in any disease name
    if (commonDiseases.some(disease => disease.toLowerCase().includes(word))) {
      return true;
    }
    
    // Check aliases
    if (Object.keys(DISEASE_ALIAS_MAP).includes(word)) {
      return true;
    }
  }
  
  // Check for question patterns about health - much broader patterns
  const healthQuestionPatterns = [
    /what (is|are) (the|a|an)?/i,
    /how (to|do|can|should|would)/i,
    /can (you|i|we|they|it|he|she)/i,
    /(is|are) there (any|some)/i,
    /(what|which) (medicine|drug|treatment|therapy|pill|medication|remedy|cure|option)/i,
    /help (me|us|with|for)/i,
    /tell (me|us) (about|more)/i,
    /need (help|advice|assistance|information)/i,
    /looking for/i,
    /want to (know|understand|learn)/i,
    /recommend/i,
    /suggest/i,
    /advice/i,
    /should i/i
  ];
  
  if (healthQuestionPatterns.some(pattern => pattern.test(normalizedQuery))) {
    return true;
  }

  // Check for clearly non-medical topics - be very strict here
  // Only reject if MULTIPLE non-medical patterns match
  let nonMedicalMatches = 0;
  for (const pattern of NON_MEDICAL_TOPICS) {
    if (pattern.test(normalizedQuery)) {
      nonMedicalMatches++;
    }
  }

  // Require at least 2 non-medical matches to reject
  if (nonMedicalMatches >= 2) {
    return false;
  }

  // Default to accepting as medical - critical override
  return true;
};

export const validateMedicalQuery = (query: string): { 
  isValid: boolean; 
  suggestion?: string;
} => {
  // Accept empty queries with a suggestion
  if (!query.trim()) {
    return {
      isValid: true,
      suggestion: "Please enter a medical query about a condition, treatment, or medication."
    };
  }

  // Check if query contains medical terminology - with our much more permissive function
  if (containsMedicalTerminology(query)) {
    return { isValid: true };
  }

  // Even if we don't think it's medical, we'll still accept it with a suggestion
  // This ensures the critical override works - we process nearly all queries
  return {
    isValid: true,
    suggestion: `I'm not certain how "${query}" relates to medicine or health. If you're asking about a health condition, medication, or treatment, please provide more details.`
  };
};
