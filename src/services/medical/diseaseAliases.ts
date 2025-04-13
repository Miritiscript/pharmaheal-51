// Medical condition aliases and abbreviations mapping
export const DISEASE_ALIAS_MAP: Record<string, string> = {
  "hiv": "HIV/AIDS",
  "aids": "HIV/AIDS",
  "tb": "Tuberculosis",
  "tuberculosis": "Tuberculosis",
  "ulcer": "Peptic Ulcer Disease",
  "ulcers": "Peptic Ulcer Disease",
  "peptic ulcer": "Peptic Ulcer Disease",
  "bp": "Hypertension",
  "high blood pressure": "Hypertension",
  "hypertension": "Hypertension",
  "diabetes": "Diabetes Mellitus",
  "type 1 diabetes": "Diabetes Mellitus Type 1",
  "type 2 diabetes": "Diabetes Mellitus Type 2",
  "cancer": "Cancer",
  "asthma": "Asthma",
  "arthritis": "Arthritis",
  "osteoarthritis": "Osteoarthritis",
  "rheumatoid arthritis": "Rheumatoid Arthritis",
  "influenza": "Influenza",
  "flu": "Influenza",
  "migraine": "Migraine",
  "migraines": "Migraine",
  "headache": "Headache",
  "headaches": "Headache",
  "heart attack": "Myocardial Infarction",
  "mi": "Myocardial Infarction",
  "heart failure": "Congestive Heart Failure",
  "chf": "Congestive Heart Failure",
  "stroke": "Cerebrovascular Accident",
  "cva": "Cerebrovascular Accident",
  "gerd": "Gastroesophageal Reflux Disease",
  "acid reflux": "Gastroesophageal Reflux Disease",
  "copd": "Chronic Obstructive Pulmonary Disease",
  "depression": "Major Depressive Disorder",
  "anxiety": "Anxiety Disorder",
  "uti": "Urinary Tract Infection",
  "ms": "Multiple Sclerosis",
  "ibs": "Irritable Bowel Syndrome",
};

// List of common symptoms for validation
export const MEDICAL_SYMPTOMS = [
  // Common symptoms
  "fever", "cough", "headache", "pain", "nausea", "vomiting", "diarrhea", 
  "fatigue", "weakness", "dizziness", "rash", "swelling", "bleeding", "bruising",
  "shortness of breath", "chest pain", "abdominal pain", "joint pain", "muscle pain",
  "sore throat", "runny nose", "congestion", "itching", "burning", "numbness",
  "tingling", "stiffness", "tremor", "seizure", "confusion", "memory loss", "insomnia",
  // Mental health symptoms
  "anxiety", "depression", "panic", "stress", "mood swings", "hallucinations",
  // Digestive symptoms
  "bloating", "constipation", "heartburn", "indigestion", "acid reflux",
  // Respiratory symptoms
  "wheezing", "breathing difficulty", "sneezing", "coughing up blood",
  // Neurological symptoms
  "migraine", "dizziness", "vertigo", "tremors", "seizures", "paralysis",
  // Skin symptoms
  "acne", "eczema", "hives", "psoriasis", "dry skin", "itching"
];

// List of medical specialties and systems
export const MEDICAL_SPECIALTIES = [
  "cardiology", "neurology", "psychiatry", "dermatology", "gastroenterology",
  "endocrinology", "rheumatology", "oncology", "pediatrics", "geriatrics",
  "orthopedics", "urology", "gynecology", "ophthalmology", "ent", "pulmonology",
  "nephrology", "immunology", "hematology", "infectious disease"
];
