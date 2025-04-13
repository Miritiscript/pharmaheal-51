
// Extended medical terminology for comprehensive query validation

export const MEDICAL_KEYWORDS = [
  // Common medical terms (core set)
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
  "diet", "exercise", "nutrition", "wellness", "prevention", "lifestyle",
  // Basic body parts and organs
  "heart", "lung", "liver", "kidney", "brain", "stomach", "intestine",
  "skin", "bone", "muscle", "blood", "nerve", "eye", "ear", "throat", "mouth",
  "head", "neck", "arm", "leg", "chest", "back", "foot", "hand", "joint",
  // Basic symptoms
  "pain", "ache", "fever", "cough", "rash", "swelling", "fatigue",
  "nausea", "vomiting", "diarrhea", "constipation", "dizziness", "weakness",
  // Common drugs and drug classes
  "aspirin", "ibuprofen", "paracetamol", "acetaminophen", "antibiotic",
  "antiviral", "painkiller", "analgesic", "sedative", "stimulant",
  "statin", "antidepressant", "antihistamine", "steroid", "insulin",
  // Basic disease types
  "infection", "inflammation", "cancer", "disorder", "syndrome",
  "allergy", "deficiency", "imbalance", "injury", "poisoning"
];

// Extended medical terminology for secondary verification
export const MEDICAL_TERMINOLOGY_EXTENDED = [
  // Body fluids and substances
  "blood", "plasma", "urine", "saliva", "sweat", "bile", "mucus", "pus",
  "semen", "lymph", "cerebrospinal fluid", "synovial fluid", "tears",
  // Detailed anatomy terms
  "artery", "vein", "capillary", "tendon", "ligament", "cartilage", "neuron",
  "follicle", "gland", "tissue", "membrane", "nucleus", "cell", "hormone",
  "enzyme", "protein", "antibody", "antigen", "receptor", "gene", "chromosome",
  // Diagnostic procedures
  "x-ray", "mri", "ct scan", "ultrasound", "biopsy", "endoscopy", "colonoscopy",
  "mammogram", "electrocardiogram", "ecg", "ekg", "electroencephalogram", "eeg",
  "blood test", "urinalysis", "culture", "pap smear", "physical examination",
  // Medical specialties (extended)
  "cardiology", "neurology", "dermatology", "gynecology", "obstetrics",
  "pediatrics", "geriatrics", "psychiatry", "oncology", "radiology",
  "orthopedics", "urology", "nephrology", "gastroenterology", "endocrinology",
  "rheumatology", "pulmonology", "hematology", "immunology", "infectious disease",
  // Common condition terms
  "cold", "flu", "virus", "bacteria", "parasite", "fungus", "infection",
  "inflammation", "fracture", "sprain", "strain", "rupture", "tear", "break",
  "concussion", "burn", "cut", "wound", "bruise", "bleeding", "clot", "rash",
  // Common medications 
  "tylenol", "advil", "aleve", "motrin", "benadryl", "zyrtec", "claritin",
  "lipitor", "crestor", "zoloft", "prozac", "xanax", "valium", "adderall",
  "viagra", "cialis", "penicillin", "amoxicillin", "metformin", "lisinopril",
  // Drug delivery forms
  "pill", "tablet", "capsule", "injection", "shot", "infusion", "patch",
  "spray", "cream", "ointment", "gel", "lotion", "syrup", "suppository",
  // Health metrics
  "blood pressure", "heart rate", "pulse", "temperature", "weight", "height",
  "bmi", "body mass index", "cholesterol", "glucose", "sugar level", "oxygen",
  // Basic treatment verbs
  "treat", "cure", "heal", "alleviate", "relieve", "manage", "prevent",
  "reduce", "increase", "improve", "worsen", "diagnose", "prescribe",
  // Herbal medicine terms
  "herbal", "natural", "supplement", "alternative", "extract", "tincture",
  "essential oil", "tea", "decoction", "poultice", "compress"
];

// List of non-medical topics for filtering
// Note: These are now used with much higher threshold for rejection
export const NON_MEDICAL_TOPICS = [
  /\b(movie|film|cinema|actor|actress|director|producer|box office|hollywood)\b/i,
  /\b(music|song|band|artist|album|concert|singer|rapper|genre|billboard|spotify)\b/i,
  /\b(sports|team|player|game|match|tournament|champion|league|score|win|lose)\b/i,
  /\b(politics|politician|election|government|policy|president|congress|senate|vote|campaign)\b/i,
  /\b(technology|computer|software|app|device|gadget|internet|website|program|code|programming)\b/i,
  /\b(business|company|corporation|industry|market|stock|profit|revenue|startup|investment)\b/i,
  /\b(food recipe|cooking|chef|restaurant|cuisine|dish|ingredient|bake|fry|roast|meal)\b/i,
  /\b(travel|vacation|holiday|tourism|destination|hotel|resort|flight|cruise|beach|mountain)\b/i,
  /\b(fashion|clothing|dress|style|trend|designer|model|runway|fabric|accessory|jewelry)\b/i,
  /\b(gaming|video game|console|playstation|xbox|nintendo|gamer|level|mission|character)\b/i
];
