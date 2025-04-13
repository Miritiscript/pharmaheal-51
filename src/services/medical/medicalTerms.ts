
// Medical terminology and keywords for query validation
export const MEDICAL_KEYWORDS = [
  // Common medical terms
  "disease", "symptom", "diagnosis", "treatment", "medicine", "drug", "medication",
  "antibiotic", "vaccine", "health", "medical", "doctor", "nurse", "pharmacy",
  "hospital", "clinic", "patient", "dosage", "prescription", "side effect",
  // Body systems
  "circulatory", "respiratory", "digestive", "nervous", "skeletal", "muscular",
  "endocrine", "immune", "integumentary", "urinary", "reproductive",
  // Medical procedures
  "surgery", "operation", "treatment", "therapy", "examination", "test", "scan",
  // Conditions and states
  "chronic", "acute", "terminal", "benign", "malignant", "hereditary", "genetic",
  // Treatment types
  "medication", "supplement", "vitamin", "mineral", "herb", "natural remedy",
  "alternative medicine", "homeopathy", "therapy", "rehabilitation",
  // Healthcare terms
  "prevention", "cure", "recovery", "healing", "remission", "prognosis",
  // Mental health
  "mental health", "psychiatry", "psychology", "counseling", "therapy",
  // Emergency terms
  "emergency", "urgent", "critical", "intensive care", "trauma",
  // Lifestyle and prevention
  "diet", "exercise", "nutrition", "wellness", "prevention", "lifestyle"
];

// List of non-medical topics for filtering
export const NON_MEDICAL_TOPICS = [
  /\b(movie|film|cinema|actor|actress|director|producer)\b/i,
  /\b(music|song|band|artist|album|concert)\b/i,
  /\b(sports|team|player|game|match|tournament)\b/i,
  /\b(politics|politician|election|government|policy)\b/i,
  /\b(technology|computer|software|app|device|gadget)\b/i,
  /\b(business|company|corporation|industry|market)\b/i,
  /\b(food recipe|cooking|chef|restaurant|cuisine)\b/i,
  /\b(travel|vacation|holiday|tourism|destination)\b/i
];

