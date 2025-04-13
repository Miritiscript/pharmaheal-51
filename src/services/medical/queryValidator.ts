
import { MEDICAL_KEYWORDS } from './medicalTerms';
import { MEDICAL_SYMPTOMS, MEDICAL_SPECIALTIES } from './diseaseAliases';
import { NON_MEDICAL_TOPICS } from './medicalTerms';

export const normalizeQuery = (query: string): string => {
  return query.toLowerCase().trim().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
};

export const containsMedicalTerminology = (query: string): boolean => {
  const normalizedQuery = normalizeQuery(query);
  
  // Check all medical keywords
  if (MEDICAL_KEYWORDS.some(term => normalizedQuery.includes(term.toLowerCase()))) {
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
  
  // Check for question patterns about health
  const healthQuestionPatterns = [
    /what (is|are) the (symptoms|causes|treatments?|signs) of/i,
    /how (to|do you) (treat|cure|manage|deal with)/i,
    /can you (tell me about|explain|describe)/i,
    /(is|are) there (any|some) (treatment|medicine|cure|remedy) for/i,
    /(what|which) (medicine|drug|treatment) (is|are) (used|prescribed|recommended) for/i
  ];
  
  if (healthQuestionPatterns.some(pattern => pattern.test(normalizedQuery))) {
    return true;
  }

  // Check for clearly non-medical topics
  if (NON_MEDICAL_TOPICS.some(pattern => pattern.test(normalizedQuery))) {
    return false;
  }

  // If unclear, lean towards accepting as medical
  return true;
};

export const validateMedicalQuery = (query: string): { 
  isValid: boolean; 
  suggestion?: string;
} => {
  if (!query.trim()) {
    return {
      isValid: false,
      suggestion: "Please enter a medical query about a condition, treatment, or medication."
    };
  }

  if (containsMedicalTerminology(query)) {
    return { isValid: true };
  }

  // If we're not sure it's medical but it's not clearly non-medical,
  // we'll accept it but might want to ask for clarification
  return {
    isValid: true,
    suggestion: `Could you provide more details about what specific health aspect of "${query}" you're interested in?`
  };
};

