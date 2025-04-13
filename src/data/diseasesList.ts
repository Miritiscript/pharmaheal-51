
// List of common diseases for autocomplete suggestions
export const commonDiseases = [
  "Allergies",
  "Alzheimer's Disease",
  "Anemia",
  "Anxiety",
  "Arthritis",
  "Asthma",
  "Autism",
  "Bronchitis",
  "Cancer",
  "Celiac Disease",
  "Chronic Fatigue Syndrome",
  "Common Cold",
  "COPD",
  "COVID-19",
  "Crohn's Disease",
  "Depression",
  "Diabetes Type 1",
  "Diabetes Type 2",
  "Eczema",
  "Endometriosis",
  "Epilepsy",
  "Fibromyalgia",
  "GERD (Acid Reflux)",
  "Glaucoma",
  "Heart Disease",
  "Hepatitis",
  "High Blood Pressure",
  "High Cholesterol",
  "HIV/AIDS",
  "Hypothyroidism",
  "IBS (Irritable Bowel Syndrome)",
  "Influenza",
  "Insomnia",
  "Kidney Disease",
  "Lupus",
  "Lyme Disease",
  "Migraine",
  "Multiple Sclerosis",
  "Osteoporosis",
  "Parkinson's Disease",
  "Pneumonia",
  "Psoriasis",
  "Rheumatoid Arthritis",
  "Schizophrenia",
  "Scoliosis",
  "Stroke",
  "Tuberculosis (TB)",
  "Ulcerative Colitis",
  "UTI (Urinary Tract Infection)",
  "Vertigo",
  "Peptic Ulcer Disease",
  "Hypertension (BP)",
  "Gastritis",
  "Malaria",
  "Typhoid",
  "Dengue Fever",
  "Jaundice",
  "Osteoarthritis",
  "Gout",
  "Sinusitis",
  "Tonsillitis",
  "Hemorrhoids",
  "Gallstones",
  "Kidney Stones",
  "Urinary Incontinence",
  "Erectile Dysfunction",
  "Menopause",
  "PCOS",
  "Thyroid Disorders"
];

// Mapping of common abbreviations and terms to their full disease names
export const diseaseAliasMap: Record<string, string> = {
  "hiv": "HIV/AIDS",
  "aids": "HIV/AIDS",
  "tb": "Tuberculosis",
  "ulcer": "Peptic Ulcer Disease",
  "ulcers": "Peptic Ulcer Disease",
  "bp": "Hypertension",
  "diabetes": "Diabetes Mellitus",
  "flu": "Influenza",
  "mi": "Myocardial Infarction",
  "chf": "Congestive Heart Failure",
  "cva": "Cerebrovascular Accident",
  "gerd": "Gastroesophageal Reflux Disease",
  "copd": "Chronic Obstructive Pulmonary Disease",
  "uti": "Urinary Tract Infection",
  "ms": "Multiple Sclerosis",
  "ibs": "Irritable Bowel Syndrome",
  "pcos": "Polycystic Ovary Syndrome",
  "ed": "Erectile Dysfunction"
};

// Helper function to normalize and match disease names
export const normalizeDiseaseInput = (input: string): string => {
  const normalizedInput = input.toLowerCase().trim();
  
  // Check for direct match in alias map
  if (diseaseAliasMap[normalizedInput]) {
    return diseaseAliasMap[normalizedInput];
  }
  
  // Check if input is contained in any disease name from the common diseases list
  const matchedDisease = commonDiseases.find(disease => 
    disease.toLowerCase().includes(normalizedInput)
  );
  
  if (matchedDisease) {
    return matchedDisease;
  }
  
  // If no match found, return the original input
  return input;
};
